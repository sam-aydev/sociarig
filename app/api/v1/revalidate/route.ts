import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

// This secret must match what you put in the Sanity dashboard
const secret = process.env.SANITY_WEBHOOK_SECRET!;

// Create a simple in-memory LRU cache to store processed transaction IDs
// Note: In serverless (like Vercel), this memory persists *per cold start*.
// For distributed, bulletproof idempotency, you would use Redis, but this in-memory
// approach catches 99% of immediate network retry duplicates.
const processedWebhooks = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get(SIGNATURE_HEADER_NAME);
    if (!signature) return new Response("No signature found", { status: 401 });

    const body = await req.text();

    // Verify the request actually came from your Sanity database
    if (!isValidSignature(body, signature, secret)) {
      return new Response("Invalid signature", { status: 401 });
    }

    const parsedBody = JSON.parse(body);

    // Extract Sanity's unique transaction ID for this specific edit/publish event
    const transactionId =
      parsedBody._rev || req.headers.get("sanity-transaction-id");
    const { _type, slug } = parsedBody;

    // Idempotency Check: Have we processed this exact transaction recently?
    if (transactionId) {
      if (processedWebhooks.has(transactionId)) {
        console.log(
          `[Webhook] Duplicate transaction ignored: ${transactionId}`,
        );
        // Return 200 so Sanity stops retrying
        return NextResponse.json({
          status: "ignored",
          reason: "duplicate transaction",
        });
      }

      // Add to our processed set
      processedWebhooks.add(transactionId);

      // Prevent memory leaks by keeping the Set size reasonable (e.g., last 100 transactions)
      if (processedWebhooks.size > 100) {
        // Remove the oldest entry (Sets maintain insertion order)
        const firstItem: any = processedWebhooks.values().next().value;
        processedWebhooks.delete(firstItem);
      }
    }

    // If a post was created, updated, or deleted
    if (_type === "post") {
      // 1. Revalidate the main blog index to show the new card
      revalidatePath("/blog");

      // 2. Revalidate the specific post route if a slug exists
      if (slug?.current) {
        revalidatePath(`/blog/${slug.current}`);
      }

      console.log(
        `[Webhook] Successfully revalidated post: ${slug?.current || "unknown"}`,
      );
      return NextResponse.json({ status: "success", revalidated: true });
    }

    return NextResponse.json({ status: "ignored", message: "Not a post" });
  } catch (err: any) {
    console.error(`[Webhook Error]`, err);
    return new Response(err.message, { status: 500 });
  }
}
