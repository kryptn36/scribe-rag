import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { cosineDistance, desc, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import { getOpenRouterChatModel, getOpenRouterEmbeddings } from "@/shared/api/ai/openrouter";
import { db } from "@/shared/api/db";
import { meetingChunks, meetings } from "@/shared/api/db/schema";
import { createClient } from "@/shared/api/supabase/server";

type ChatMessage = {
  role?: string;
  content?: unknown;
  parts?: Array<{
    type?: string;
    text?: unknown;
  }>;
};

const MAX_HISTORY_MESSAGES = 8;

function extractMessageText(message: ChatMessage | undefined) {
  if (!message) {
    return "";
  }

  const partsText = message.parts
    ?.filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();

  if (partsText) {
    return partsText;
  }

  return typeof message.content === "string" ? message.content.trim() : "";
}

function formatConversationHistory(messages: ChatMessage[]) {
  return messages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => {
      const text = extractMessageText(message);

      if (!text) {
        return null;
      }

      const role = message.role === "assistant" ? "Assistant" : "User";
      return `${role}: ${text}`;
    })
    .filter((message): message is string => Boolean(message))
    .join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, meetingId } = await req.json() as {
      messages?: ChatMessage[];
      meetingId?: string;
    };

    if (!messages?.length || !meetingId) {
      return new Response("Missing messages or meetingId", { status: 400 });
    }

    // AI SDK v5 UIMessages use parts[], legacy uses .content
    const lastMsg = messages[messages.length - 1];
    const userMessage = extractMessageText(lastMsg);

    if (!userMessage) {
      return new Response("Missing user message", { status: 400 });
    }

    // Verify ownership
    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.id, meetingId),
    });

    if (!meeting || meeting.userId !== user.id) {
      return new Response("Meeting not found or unauthorized", { status: 404 });
    }

    // Embed query and search
    const embeddingsModel = getOpenRouterEmbeddings();
    const conversationHistory = formatConversationHistory(messages.slice(0, -1));
    const recentUserMessages = messages
      .filter((message) => message.role === "user")
      .slice(-3)
      .map(extractMessageText)
      .filter(Boolean)
      .join("\n");
    const retrievalQuery = recentUserMessages || userMessage;
    const queryEmbedding = await embeddingsModel.embedQuery(retrievalQuery);

    const similarity = sql<number>`1 - (${cosineDistance(meetingChunks.embedding, queryEmbedding)})`;

    const similarChunks = await db
      .select({ content: meetingChunks.content, similarity })
      .from(meetingChunks)
      .where(eq(meetingChunks.meetingId, meetingId))
      .orderBy((t) => desc(t.similarity))
      .limit(5);

    const context = similarChunks.map((c) => c.content).join("\n\n");

    const prompt = PromptTemplate.fromTemplate(`
You are an AI assistant helping with meeting transcripts.
Use the transcript context to answer the current question.
Use the conversation history only to resolve follow-up references and keep continuity.
If you don't know the answer based on the transcript context, say so.
Answer in the same natural language as the current question unless the user explicitly requests another language.

Transcript context:
{context}

Conversation history:
{conversationHistory}

Current question: {question}
Answer:`);

    const model = getOpenRouterChatModel();
    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const langchainStream = await chain.stream({
      context,
      conversationHistory: conversationHistory || "No previous messages in this chat.",
      question: userMessage,
    });

    // Use AI SDK v5 UI message stream format (required by useChatRuntime)
    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        async execute({ writer }) {
          const partId = "rag-response";
          writer.write({ type: "text-start", id: partId });

          let chunkCount = 0;
          for await (const chunk of langchainStream) {
            if (chunk) {
              chunkCount++;
              writer.write({ type: "text-delta", id: partId, delta: chunk });
            }
          }

          console.log(`[RAG] Stream ended after ${chunkCount} chunks`);
          writer.write({ type: "text-end", id: partId });
        },
        onError: (error) => {
          console.error("Chat stream error:", error);
          return error instanceof Error ? error.message : "Internal Server Error";
        },
      }),
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
