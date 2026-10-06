import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client";
import { createClient } from "@/app/lib/util/supabase/server";

export async function POST(req: Request) {
  // We initialize a rollback context outside the try block so the catch block can access it
  const rollbackContext = {
    userId: "",
    generationId: "",
    originalUsed: 0,
    creditsDeducted: false,
  };

  try {
    const body = await req.json();
    const {
      generationId,
      inputMode,
      inputValue,
      voiceId,
      platforms,
      platformCounts,
    } = body;

    // Track generation ID immediately in case we need to mark it as failed
    rollbackContext.generationId = generationId;

    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    rollbackContext.userId = user.id;

    // 2. ATOMIC LOCK (Idempotency Check)
    const { data: lockedGen } = await supabase
      .from("content_generations")
      .update({ status: "processing" })
      .eq("id", generationId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (!lockedGen) {
      return NextResponse.json({
        success: true,
        message: "Already processing",
      });
    }

    // 3. Fetch Subscription Limits
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("name, generations_used, max_generations, status")
      .eq("user_id", user.id)
      .maybeSingle();

    const planName =
      sub?.status === "active" ? sub?.name?.toLowerCase() || "free" : "free";
    const used = sub?.generations_used || 0;
    const max = sub?.status === "active" ? sub?.max_generations || 5 : 5;

    // Save the user's original credit usage so we can revert to it if Inngest fails
    rollbackContext.originalUsed = used;

    // Security: Prevent Free users from generating Newsletters
    if (platforms.includes("newsletter") && planName.includes("free")) {
      await supabase
        .from("content_generations")
        .update({ status: "failed", error_message: "Upgrade plan" })
        .eq("id", generationId);
      return NextResponse.json(
        { error: "Newsletter generation requires the Starter plan or higher." },
        { status: 403 },
      );
    }

    // Calculate total requested volume
    let requestedCount = 0;
    for (const p of platforms) {
      requestedCount += platformCounts[p] || 1;
    }

    // Security: Enforce Generation Limits
    if (used + requestedCount > max) {
      await supabase
        .from("content_generations")
        .update({ status: "failed", error_message: "Limit exceeded" })
        .eq("id", generationId);

      return NextResponse.json(
        {
          error: `Limit exceeded. You requested ${requestedCount} items, but only have ${max - used} left.`,
        },
        { status: 403 },
      );
    }

    // 4. Deduct Credits
    const { error: usageError } = await supabase
      .from("subscriptions")
      .update({ generations_used: used + requestedCount })
      .eq("user_id", user.id);

    if (usageError) {
      await supabase
        .from("content_generations")
        .update({ status: "failed", error_message: "Usage update failed" })
        .eq("id", generationId);
      throw new Error(`Failed to update usage limits: ${usageError.message}`);
    }

    // Register that credits were successfully deducted so the catch block knows to refund them if needed
    rollbackContext.creditsDeducted = true;

    // 5. Trigger Background Worker
    const inngestPayload = {
      name: "app/generate.content",
      id: `generation-${generationId}`,
      data: {
        generationId,
        inputMode,
        inputValue,
        voiceId,
        platforms,
        platformCounts,
      },
    };

    // If the local Inngest server isn't running, this will throw the "fetch failed" error and jump to catch()
    await inngest.send(inngestPayload);

    return NextResponse.json({ success: true, generationId });
  } catch (error: any) {
    console.error(
      "[DEBUG ERROR] Generation API Caught Exception:",
      error?.message || error,
    );

    // ==========================================
    // CRITICAL FIX: AUTOMATIC REFUND & ROLLBACK
    // ==========================================
    try {
      const supabase = await createClient();

      // 1. If we got far enough to know the generation ID, mark it as failed so the UI unlocks
      if (rollbackContext.generationId) {
        await supabase
          .from("content_generations")
          .update({
            status: "failed",
            error_message: "Failed to connect to background worker.",
          })
          .eq("id", rollbackContext.generationId);
      }

      // 2. If we deducted credits before the crash, refund them back to the original amount
      if (rollbackContext.creditsDeducted && rollbackContext.userId) {
        console.log(
          `[ROLLBACK] Refunding user back to ${rollbackContext.originalUsed} credits...`,
        );
        await supabase
          .from("subscriptions")
          .update({ generations_used: rollbackContext.originalUsed })
          .eq("user_id", rollbackContext.userId);
      }
    } catch (rollbackError) {
      console.error("CRITICAL: Rollback failed!", rollbackError);
    }
    // ==========================================

    return NextResponse.json(
      { error: error?.message || "Failed to initiate generation" },
      { status: 500 },
    );
  }
}
