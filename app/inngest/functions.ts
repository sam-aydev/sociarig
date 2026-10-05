import { inngest } from "./client";
import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript-plus";
import * as cheerio from "cheerio"; // For scraping generic blogs/articles
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing-key-fallback",
});

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || "missing-key-fallback",
  baseURL: "https://api.x.ai/v1",
});

// Always use the Service Role Key for backend tasks to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.SUPABASE_SECRET_KEY!,
);

// --- SIMPLIFIED JSON SCHEMA MAPPINGS ---
const JSON_SCHEMA_MAPPING: Record<string, any> = {
  twitter: {
    type: "array",
    items: { type: "string" },
    description:
      "An array of distinct, standalone Twitter posts. Keep each under 280 characters.",
  },
  threads: {
    type: "array",
    items: { type: "string" },
    description: "An array of distinct, standalone Meta Threads posts.",
  },
  linkedin: {
    type: "array",
    items: { type: "string" },
    description: "An array of distinct LinkedIn post variations.",
  },
  instagram: {
    type: "array",
    items: { type: "string" },
    description: "An array of distinct Instagram caption variations.",
  },
  newsletter: {
    type: "array",
    items: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Catchy email subject line" },
        html: {
          type: "string",
          description: "Email body formatted in basic HTML (p, b, i, br tags)",
        },
      },
      required: ["subject", "html"],
    },
    description: "An array of distinct newsletter variations.",
  },
};

export const generateContent = inngest.createFunction(
  {
    id: "generate-dynamic-content",
    name: "Flexible Output Generator",
    retries: 2,
    concurrency: { limit: 5 },
    triggers: [{ event: "app/generate.content" }],
  },
  async ({ event, step }) => {
    const {
      generationId,
      inputMode,
      inputValue,
      voiceId,
      platforms,
      platformCounts,
    } = event.data;

    try {
      // Step 1: Status update
      await step.run("update-status-processing", async () => {
        const { error } = await supabase
          .from("content_generations")
          .update({
            status: "processing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", generationId);
        if (error) throw new Error(`Database update failed: ${error.message}`);
      });

      // Step 2: Intelligent Content Extraction
      const extractedText = await step.run(
        "extract-source-content",
        async () => {
          if (inputMode === "idea") {
            return inputValue;
          }

          if (inputMode === "url") {
            if (
              inputValue.includes("youtube.com") ||
              inputValue.includes("youtu.be")
            ) {
              const transcript =
                await YoutubeTranscript.fetchTranscript(inputValue);
              if (!transcript || transcript.length === 0)
                throw new Error("Transcript is empty or unavailable.");
              return transcript.map((t) => t.text).join(" ");
            }

            const res = await fetch(inputValue, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
              },
            });

            if (!res.ok) {
              throw new Error(`Failed to fetch URL: ${res.statusText}`);
            }

            const html = await res.text();
            const $ = cheerio.load(html);

            let articleText = "";
            $("h1, h2, h3, p").each((_, el) => {
              articleText += $(el).text() + "\n\n";
            });

            if (articleText.trim().length < 50)
              throw new Error(
                "Could not extract meaningful text from this URL.",
              );
            return articleText.trim().substring(0, 30000);
          }

          throw new Error("Invalid input mode provided.");
        },
      );

      // Step 3: RAG Retrieval - Find the user's voice
      const voiceExamples = await step.run(
        "retrieve-voice-examples",
        async () => {
          const searchQuery = extractedText.substring(0, 1000);

          const embeddingRes = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: searchQuery,
          });

          const { data: matchedChunks, error } = await supabase.rpc(
            "match_voice_embeddings",
            {
              query_embedding: embeddingRes.data[0].embedding,
              match_threshold: 0.3,
              match_count: 5,
              p_voice_id: voiceId,
            },
          );

          if (error) throw new Error(`Vector search failed: ${error.message}`);
          if (!matchedChunks || matchedChunks.length === 0)
            return "No exact past writing examples found. Use a clear, authentic professional tone.";
          return matchedChunks
            .map((chunk: { content: string }) => chunk.content)
            .join("\n\n---\n\n");
        },
      );

      // Step 4: Generate Content with Grok using Strict Dynamic Schemas
      const generatedData = await step.run("call-grok-dynamic", async () => {
        const zodShape: Record<string, any> = {};
        const jsonProperties: Record<string, any> = {};

        let countSummary = "REQUIRED VARIATION COUNTS:\n";

        platforms.forEach((platform: string) => {
          const count = Number(platformCounts?.[platform]) || 1;
          countSummary += `- ${platform}: EXACTLY ${count} standalone post(s)\n`;

          if (platform === "newsletter") {
            jsonProperties[platform] = {
              type: "array",
              minItems: count,
              maxItems: count,
              description: `An array containing exactly ${count} distinct newsletter(s).`,
              items: JSON_SCHEMA_MAPPING.newsletter.items,
            };

            zodShape[platform] = z
              .array(
                z.object({
                  subject: z.string().min(1),
                  html: z.string().min(1),
                }),
              )
              .length(count, `Expected exactly ${count} newsletter(s)`);
          } else {
            jsonProperties[platform] = {
              type: "array",
              minItems: count,
              maxItems: count,
              description: `An array containing exactly ${count} distinct standalone post(s).`,
              items: { type: "string" },
            };

            zodShape[platform] = z
              .array(z.string().min(1))
              .length(count, `Expected exactly ${count} ${platform} post(s)`);
          }
        });

        const DynamicExpectedSchema = z.object(zodShape);

        const response = await xai.chat.completions.create({
          model: "grok-4.7",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content:
                "You are an expert multi-platform content strategist. You MUST return the exact number of standalone posts specified in the schema for every platform. Do NOT write multi-part threads. Keep Twitter posts under 280 characters. Do not use escaped newline characters (\\n), use actual line breaks.",
            },
            {
              role: "user",
              content: `Repurpose the following content based on these exact volume specifications:\n${countSummary}\n\nVOICE EXAMPLES:\n${voiceExamples}\n\nSOURCE CONTENT:\n${extractedText}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "save_content",
                description:
                  "Save generated standalone content variations across all requested platforms.",
                parameters: {
                  type: "object",
                  properties: jsonProperties,
                  required: Object.keys(jsonProperties),
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "save_content" } },
        });

        const toolCall = response.choices[0].message.tool_calls?.[0];
        if (
          !toolCall ||
          toolCall.type !== "function" ||
          !("function" in toolCall) ||
          (toolCall as any).function.name !== "save_content"
        ) {
          throw new Error(
            "Grok failed to execute the required save_content tool.",
          );
        }

        const rawArgs = JSON.parse((toolCall as any).function.arguments);
        return DynamicExpectedSchema.parse(rawArgs);
      });

      // Step 5: Save Success to Database
      await step.run("save-results", async () => {
        const { error } = await supabase
          .from("content_generations")
          .update({
            status: "completed",
            result_data: generatedData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", generationId);

        if (error) throw new Error(`Failed to save results: ${error.message}`);
      });

      return { success: true, generationId };
    } catch (error) {
      // CRITICAL FIX: Refund Logic
      await step.run("save-error-and-refund", async () => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown critical error occurred";

        console.error(`[Inngest Error - ${generationId}]:`, errorMessage);

        // 1. Mark generation as failed and retrieve user_id
        const { data: genData } = await supabase
          .from("content_generations")
          .update({
            status: "failed",
            error_message: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", generationId)
          .select("user_id")
          .maybeSingle();

        // 2. Automatically Refund the Credits!
        if (genData?.user_id) {
          // Calculate how many credits we originally charged for this run
          let requestedCount = 0;
          if (platforms && platformCounts) {
            platforms.forEach((p: string) => {
              requestedCount += Number(platformCounts[p]) || 1;
            });
          }

          if (requestedCount > 0) {
            // Fetch current usage
            const { data: sub } = await supabase
              .from("subscriptions")
              .select("generations_used")
              .eq("user_id", genData.user_id)
              .single();

            if (sub) {
              // Subtract the failed amount, ensuring we don't go below 0
              const newUsage = Math.max(
                0,
                (sub.generations_used || 0) - requestedCount,
              );

              // Update the subscription back to the refunded amount
              await supabase
                .from("subscriptions")
                .update({ generations_used: newUsage })
                .eq("user_id", genData.user_id);
            }
          }
        }
      });

      // Rethrow so Inngest registers the failure in the dashboard
      throw error;
    }
  },
);
