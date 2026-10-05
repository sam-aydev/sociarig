import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Map your Lemon Squeezy Variant IDs to their generation limits
const PLAN_LIMITS: Record<number, number> = {
  2189842: 150, // STARTER PLAN Variant ID
  2189848: 500, // PREMIUM PLAN Variant ID
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("X-Signature") || "";
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;

    // 1. Verify the Webhook Signature
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (
      digest.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(digest, signatureBuffer)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const eventId = payload.meta.event_id; // Unique ID from Lemon Squeezy
    const obj = payload.data.attributes;

    // 2. IDEMPOTENCY CHECK
    // Attempt to insert the event_id into our tracking table.
    // If it violates the primary key constraint, we've already processed it.
    const { error: idempotencyError } = await supabaseAdmin
      .from("webhook_events")
      .insert({ event_id: eventId, event_name: eventName });

    if (idempotencyError) {
      // 23505 is the PostgreSQL error code for unique_violation
      if (idempotencyError.code === "23505") {
        console.log(`[Webhook] Event ${eventId} already processed. Skipping.`);
        return NextResponse.json({
          success: true,
          message: "Already processed",
        });
      }
      throw new Error(`Idempotency check failed: ${idempotencyError.message}`);
    }

    // Extract user_id from custom_data (passed during checkout)
    const userId = payload.meta.custom_data?.user_id;

    // 3. Handle Order Refunds
    if (eventName === "order_refunded") {
      const customerEmail = obj.user_email;

      const { error: refundError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "refunded",
          max_generations: 5,
          generations_used: 0,
        })
        .eq("email", customerEmail);

      if (refundError)
        throw new Error(`Failed to process refund: ${refundError.message}`);
      return NextResponse.json({ success: true });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "No user_id found in custom_data" },
        { status: 400 },
      );
    }

    // 4. Handle Subscription Created, Updated, Cancelled, Expired, Paused
    if (
      eventName === "subscription_created" ||
      eventName === "subscription_updated" ||
      eventName === "subscription_cancelled" ||
      eventName === "subscription_expired" ||
      eventName === "subscription_paused"
    ) {
      const variantId = obj.variant_id;
      const isInactive = ["cancelled", "expired", "paused"].includes(
        obj.status,
      );
      const maxGenerations = isInactive ? 5 : PLAN_LIMITS[variantId] || 5;

      const subscriptionData: any = {
        user_id: userId,
        lemon_squeezy_id: payload.data.id.toString(),
        order_id: obj.order_id,
        name: obj.product_name,
        email: obj.user_email,
        status: obj.status, // 'active', 'cancelled', 'expired'
        renews_at: obj.renews_at,
        ends_at: obj.ends_at,
        trial_ends_at: obj.trial_ends_at,
        price_id: variantId ? variantId.toString() : "",
        customer_portal_url: obj.urls?.customer_portal,
        max_generations: maxGenerations,
      };

      // FIX: Only reset generations_used to 0 if it's a BRAND NEW subscription.
      // If we did this on 'subscription_updated', users updating their credit card
      // would accidentally get their usage reset for free.
      if (eventName === "subscription_created") {
        subscriptionData.generations_used = 0;
      }

      const { error } = await supabaseAdmin
        .from("subscriptions")
        .upsert(subscriptionData, { onConflict: "lemon_squeezy_id" });

      if (error) throw new Error(`Database error: ${error.message}`);
    }

    // 5. Handle Subscription Payment Success (Monthly Reset)
    // This fires every time a successful recurring charge happens.
    if (eventName === "subscription_payment_success") {
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({ generations_used: 0 })
        .eq("lemon_squeezy_id", obj.subscription_id.toString());

      if (error) throw new Error(`Failed to reset usage: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
