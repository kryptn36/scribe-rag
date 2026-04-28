"use server";

import { revalidatePath } from "next/cache";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { getOpenRouterEmbeddings, getOpenRouterChatModel } from "@/shared/api/ai/openrouter";
import { db } from "@/shared/api/db";
import { meetings, meetingChunks, followUps, followUpDependencies } from "@/shared/api/db/schema";
import { createClient } from "@/shared/api/supabase/server";

import { eq } from "drizzle-orm";
import { after } from "next/server";

export async function processMeetingTranscript(title: string, transcript: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Create the meeting first with processing status
  const [meeting] = await db
    .insert(meetings)
    .values({
      title,
      transcript,
      userId: user.id,
      status: "processing",
    })
    .returning();

  // Run the processing in the background
  after(async () => {
    try {
      // Generate summary and action items
      const chatModel = getOpenRouterChatModel();

      const aiResponse = await chatModel.invoke([
        new SystemMessage(
          `You are a helpful assistant that processes meeting transcripts. You must extract:
1. A concise summary of the meeting
2. Structured follow-up action items with dependency relationships between them
3. The approximate meeting duration in seconds

Reply in JSON format with these keys:
- "summary": a concise summary string
- "durationSeconds": integer (approximate meeting length in seconds from timestamps)
- "followUps": an array of objects, each with:
  - "title": short actionable title (max 100 chars)
  - "description": detailed description of the action (nullable)
  - "priority": "low" | "medium" | "high"
  - "dependsOn": array of 0-based indices referencing other follow-ups in this array that must be completed first

Example: if follow-up at index 2 depends on follow-up at index 0, set dependsOn: [0] for item 2.
Only add dependencies when there is a clear logical ordering (e.g., "review design" must happen before "implement design").`,
        ),
        new HumanMessage(`Transcript:\n\n${transcript}`),
      ]);

      let summary = "";
      let actionItems = "";
      let duration: number | null = null;

      interface ExtractedFollowUp {
        title: string;
        description?: string;
        priority?: "low" | "medium" | "high";
        dependsOn?: number[];
      }
      let extractedFollowUps: ExtractedFollowUp[] = [];

      try {
        const textContent = aiResponse.content
          .toString()
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(textContent);
        summary = parsed.summary || "No summary generated.";
        duration = typeof parsed.durationSeconds === "number" ? parsed.durationSeconds : null;

        if (Array.isArray(parsed.followUps)) {
          extractedFollowUps = parsed.followUps;
          // Build legacy text format as fallback
          actionItems = extractedFollowUps
            .map((fu) => `• ${fu.title}${fu.description ? ` — ${fu.description}` : ""}`)
            .join("\n");
        } else if (parsed.actionItems) {
          actionItems = parsed.actionItems;
        } else {
          actionItems = "No action items identified.";
        }
      } catch (e) {
        console.error("Failed to parse AI response", e);
        summary = "Failed to generate summary.";
        actionItems = aiResponse.content.toString();
      }

      // Update the meeting with the generated text and AI-inferred duration
      // (status stays "processing" until all steps — including RAG embedding — succeed)
      await db
        .update(meetings)
        .set({
          summary,
          actionItems,
          duration,
        })
        .where(eq(meetings.id, meeting.id));

      // Insert structured follow-ups and their dependencies
      if (extractedFollowUps.length > 0) {
        const insertedFollowUps = await db
          .insert(followUps)
          .values(
            extractedFollowUps.map((fu, i) => ({
              meetingId: meeting.id,
              title: fu.title,
              description: fu.description ?? null,
              position: i,
              priority: fu.priority ?? "medium",
              status: "pending" as const,
            })),
          )
          .returning();

        // Build dependency edges from index references
        const depEdges: { sourceId: string; targetId: string }[] = [];
        for (let i = 0; i < extractedFollowUps.length; i++) {
          const deps = extractedFollowUps[i].dependsOn ?? [];
          for (const depIdx of deps) {
            if (depIdx >= 0 && depIdx < insertedFollowUps.length && depIdx !== i) {
              depEdges.push({
                sourceId: insertedFollowUps[i].id,
                targetId: insertedFollowUps[depIdx].id,
              });
            }
          }
        }

        if (depEdges.length > 0) {
          await db.insert(followUpDependencies).values(depEdges);
        }
      }

      // Process chunks for RAG
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
      });

      const chunks = await splitter.createDocuments([transcript]);
      const strings = chunks.map((c) => c.pageContent);

      const embeddingsModel = getOpenRouterEmbeddings();
      const embeddings = await embeddingsModel.embedDocuments(strings);

      const chunkRows = strings.map((content, idx) => ({
        meetingId: meeting.id,
        content,
        embedding: embeddings[idx],
      }));

      if (chunkRows.length > 0) {
        await db.insert(meetingChunks).values(chunkRows);
      }

      // All processing succeeded — mark as completed
      await db.update(meetings).set({ status: "completed" }).where(eq(meetings.id, meeting.id));
    } catch (err) {
      console.error("Background processing failed:", err);
      // Optional: Set status to failed
      await db.update(meetings).set({ status: "failed" }).where(eq(meetings.id, meeting.id));
    }
  });

  return meeting;
}

export async function renameMeeting(meetingId: string, newTitle: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const trimmed = newTitle.trim();
  if (!trimmed) throw new Error("Title cannot be empty");

  await db.update(meetings).set({ title: trimmed }).where(eq(meetings.id, meetingId));

  revalidatePath("/dashboard", "layout");
}

export async function deleteMeeting(meetingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Delete the meeting. Cascade will handle chunks.
  await db.delete(meetings).where(eq(meetings.id, meetingId));

  revalidatePath("/dashboard", "layout");
}
