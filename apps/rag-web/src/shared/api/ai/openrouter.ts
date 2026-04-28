import { ChatOpenRouter } from "@langchain/openrouter";
import { OpenAIEmbeddings } from "@langchain/openai";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";
const siteName = "rag-web";

export function getOpenRouterChatModel(modelName = "openai/gpt-5.4") {
  return new ChatOpenRouter({
    model: modelName,
    apiKey: process.env.OPENROUTER_API_KEY,
    siteUrl,
    siteName,
  });
}

export function getOpenRouterEmbeddings(modelName = "openai/text-embedding-3-large") {
  return new OpenAIEmbeddings({
    model: modelName,
    apiKey: process.env.OPENROUTER_API_KEY,
    dimensions: 1536,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": siteUrl,
        "X-Title": siteName,
      },
    },
  });
}
