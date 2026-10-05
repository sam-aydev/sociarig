import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client";
import { createClient } from "@/app/lib/util/supabase/server";

export async function POST(req: Request) {
  // console.log("\n================ [POST /api/v1/generations] ================");
  // console.log("[DEBUG 0] Request received at:", new Date().toISOString());

  try {
    const body = await req.json();
    // console.log("[DEBUG 1] Request Body:", JSON.stringify(body, null, 2));

    const {
      generationId,
      inputMode,
      inputValue,
      voiceId,
      platforms,
      platformCounts,
    } = body;

    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log(
      "[DEBUG 2] Auth check -> User ID:",
      user?.id,
      "| Error:",
      authError?.message || null,
    );

    if (authError || !user) {
      console.warn("[DEBUG 2.1] Exiting: Unauthorized user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. ATOMIC LOCK (Idempotency Check)
    console.log(
      `[DEBUG 3] Attempting atomic lock on generationId: "${generationId}" with status "pending"...`,
    );

    // First, let's check the current state of this row to see what Supabase sees
    const { data: existingRow, error: checkErr } = await supabase
      .from("content_generations")
      .select("id, status, user_id")
      .eq("id", generationId)
      .maybeSingle();

    console.log(
      "[DEBUG 3.1] Existing row in DB before lock:",
      existingRow,
      "| Query error:",
      checkErr?.message || null,
    );

    const { data: lockedGen, error: lockError } = await supabase
      .from("content_generations")
      .update({ status: "processing" })
      .eq("id", generationId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    // console.log(
    //   "[DEBUG 3.2] Lock query result -> lockedGen:",
    //   lockedGen,
    //   "| Lock error:",
    //   lockError?.message || null,
    // );

    if (!lockedGen) {
      // console.warn(
      //   `[DEBUG 3.3] ⚠️ LOCK FAILED! lockedGen is null. Either status was not "pending", row doesn't exist, or Supabase RLS is blocking UPDATE.`,
      // );
      // console.warn(
      //   "[DEBUG 3.4] Returning early with 'Already processing' (Inngest will NOT be called).",
      // );
      return NextResponse.json({
        success: true,
        message: "Already processing",
      });
    }

    // console.log("[DEBUG 4] Lock acquired successfully!");

    // 3. Fetch Subscription Limits
    // console.log(`[DEBUG 5] Fetching subscription for user_id: "${user.id}"...`);
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("name, generations_used, max_generations, status")
      .eq("user_id", user.id)
      .maybeSingle();

    // console.log(
    //   "[DEBUG 5.1] Subscription data:",
    //   sub,
    //   "| Error:",
    //   subError?.message || null,
    // );

    const planName =
      sub?.status === "active" ? sub?.name?.toLowerCase() || "free" : "free";
    const used = sub?.generations_used || 0;
    const max = sub?.status === "active" ? sub?.max_generations || 5 : 5;

    console.log(
      `[DEBUG 5.2] Plan: "${planName}" | Used: ${used} | Max: ${max}`,
    );

    // Security: Prevent Free users from generating Newsletters
    if (platforms.includes("newsletter") && planName.includes("free")) {
      console.warn("[DEBUG 5.3] Blocked: Newsletter requested on Free plan");
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
    console.log(
      `[DEBUG 6] Requested count: ${requestedCount} (used + requested = ${used + requestedCount}, max = ${max})`,
    );

    // Security: Enforce Generation Limits
    if (used + requestedCount > max) {
      console.warn("[DEBUG 6.1] Limit exceeded. Reverting status to failed...");
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
    console.log(
      `[DEBUG 7] Deducting credits: setting generations_used to ${used + requestedCount}...`,
    );
    const { error: usageError } = await supabase
      .from("subscriptions")
      .update({ generations_used: used + requestedCount })
      .eq("user_id", user.id);

    if (usageError) {
      console.error("[DEBUG 7.1] Usage update failed:", usageError.message);
      await supabase
        .from("content_generations")
        .update({ status: "failed", error_message: "Usage update failed" })
        .eq("id", generationId);
      throw new Error(`Failed to update usage limits: ${usageError.message}`);
    }
    console.log("[DEBUG 7.2] Credits deducted successfully in DB.");

   
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
    console.log(
      "[DEBUG 8.2] inngest.send payload:",
      JSON.stringify(inngestPayload, null, 2),
    );

    const result = await inngest.send(inngestPayload);
    console.log(
      "[DEBUG 9] 🎉 Inngest Dispatch Result:",
      JSON.stringify(result, null, 2),
    );

    console.log(
      "================ [END POST /api/v1/generations SUCCESS] ================\n",
    );
    return NextResponse.json({ success: true, generationId });
  } catch (error: any) {
    console.error(
      "[DEBUG ERROR] Generation API Caught Exception:",
      error?.message || error,
    );
    console.error(error?.stack);
    console.log(
      "================ [END POST /api/v1/generations ERROR] ================\n",
    );
    return NextResponse.json(
      { error: error?.message || "Failed to initiate generation" },
      { status: 500 },
    );
  }
}
