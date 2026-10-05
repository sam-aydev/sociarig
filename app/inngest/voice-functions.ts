import { inngest } from "./client";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { NonRetriableError } from "inngest";

// Support both environment variable naming conventions
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
});
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Robust chunking function that strictly respects token/character limits
function chunkText(text: string, maxChunkLength: number = 2000): string[] {
  if (!text || !text.trim()) return [];

  // 1. Normalize spacing and newlines (some PDFs output \r\n)
  const normalized = text.replace(/\r\n/g, "\n");
  const paragraphs = normalized.split(/\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // 2. If a single paragraph is dangerously long, split it down by sentences
    if (trimmed.length > maxChunkLength) {
      // Flush the current chunk if it has content
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      // Split by common sentence terminators (., !, ?)
      const sentences = trimmed.match(
        /[^.!?]+[.!?]+(?:\s|$)\vert{}[^.!?]+$/g,
      ) || [trimmed];

      for (const sentence of sentences) {
        if (sentence.length > maxChunkLength) {
          // 3. Fallback: If a sentence is somehow STILL too long (e.g. minified text), hard-slice it
          if (currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = "";
          }
          for (let i = 0; i < sentence.length; i += maxChunkLength) {
            chunks.push(sentence.slice(i, i + maxChunkLength).trim());
          }
        } else if (currentChunk.length + sentence.length > maxChunkLength) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? " " : "") + sentence;
        }
      }
    }
    // 4. Standard paragraph handling
    else if (currentChunk.length + trimmed.length > maxChunkLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export const processVoiceDocument = inngest.createFunction(
  {
    id: "process-voice-document",
    name: "Chunk and Embed Voice Source",
    retries: 2,
    triggers: [{ event: "app/voice.process" }],
  },
  async ({ event, step }) => {
    const { documentId, rawContent } = event.data;

    try {
      // Step 1: Safely chunk the raw text
      const chunks = await step.run("chunk-text", async () => {
        const result = chunkText(rawContent);
        if (result.length === 0) {
          throw new Error("Document is empty or contains no readable text.");
        }
        return result;
      });

      // Step 2: Get Embeddings from OpenAI for all chunks in one batch
      // OpenAI accepts arrays up to 2048 elements; our chunks easily fall within this safely.
      const embeddings = await step.run("generate-embeddings", async () => {
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunks,
        });
        return response.data;
      });

      // Step 3: Save chunks and vectors to Supabase
      await step.run("save-embeddings", async () => {
        const insertData = chunks.map((chunk, i) => ({
          document_id: documentId,
          content: chunk,
          embedding: embeddings[i].embedding,
        }));

        const { error } = await supabase
          .from("voice_embeddings")
          .insert(insertData);
        if (error)
          throw new Error(`Failed to insert embeddings: ${error.message}`);
      });

      // Step 4: Mark document as completed
      await step.run("update-document-status", async () => {
        await supabase
          .from("voice_documents")
          .update({ status: "completed" })
          .eq("id", documentId);
      });

      return { success: true, chunksProcessed: chunks.length };
    } catch (error: any) {
      // Step 5 (CRITICAL FIX): If ANY step fails, explicitly update the database so the frontend UI stops spinning
      await step.run("mark-document-failed", async () => {
        await supabase
          .from("voice_documents")
          .update({
            status: "failed",
            error_message: error?.message || "Failed to generate AI embeddings",
          })
          .eq("id", documentId);
      });

      // We throw a NonRetriableError to instantly fail the job in Inngest,
      // rather than quietly retrying 2 more times (which would just hit the API limits again).
      throw new NonRetriableError(error?.message || "Processing failed");
    }
  },
);
