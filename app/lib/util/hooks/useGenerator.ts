import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/app/lib/util/supabase/client";
import { toast } from "sonner";

export type EngineState = "idle" | "processing" | "completed" | "error";
export type InputMode = "url" | "idea";

export function useGenerator() {
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [inputValue, setInputValue] = useState("");
  const [engineState, setEngineState] = useState<EngineState>("idle");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const [platforms, setPlatforms] = useState({
    twitter: true,
    linkedin: true,
    instagram: false,
    newsletter: false,
    threads: false,
  });

  const [platformCounts, setPlatformCounts] = useState({
    twitter: 1,
    threads: 1,
    linkedin: 1,
    instagram: 1,
    newsletter: 1,
  });

  const setPlatformCount = (
    platform: keyof typeof platformCounts,
    count: number,
  ) => {
    setPlatformCounts((prev) => ({ ...prev, [platform]: count }));
  };

  const supabase = createClient();
  const queryClient = useQueryClient();

  const togglePlatform = (key: keyof typeof platforms) => {
    setPlatforms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(platforms).filter(Boolean).length;

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (selectedCount === 0)
        throw new Error("Select at least one target platform.");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // 1. Calculate EXACT requested volume from the UI sliders
      let requestedCount = 0;
      const selectedPlatformsArray = Object.entries(platforms)
        .filter(([_, isSelected]) => isSelected)
        .map(([key]) => key);

      const activeCounts: Record<string, number> = {};
      selectedPlatformsArray.forEach((p) => {
        const count = platformCounts[p as keyof typeof platformCounts] || 1;
        activeCounts[p] = count;
        requestedCount += count;
      });

      // 2. STRICT PLAN VALIDATION
      const { data: sub, error: subError } = await supabase
        .from("subscriptions")
        .select("generations_used, max_generations")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subError) {
        throw new Error("Could not verify your subscription plan.");
      }

      const currentUsed = sub?.generations_used || 0;
      const currentMax = sub?.max_generations || 5;

      // Check if they have enough credits for this specific request
      if (currentUsed + requestedCount > currentMax) {
        const remaining = Math.max(0, currentMax - currentUsed);
        throw new Error(
          `Plan exhausted. You requested ${requestedCount} items, but only have ${remaining} left. Please upgrade.`,
        );
      }

      // 3. SETUP FREE PLAN (DO NOT DEDUCT)
      if (!sub) {
        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            status: "free",
            name: "Free Plan",
            generations_used: 0, // Starts at 0. API route will handle the deduction.
            max_generations: 5,
            lemon_squeezy_id: `free_${user.id}`,
            order_id: 0,
            email: user.email || "",
            price_id: "0",
          });

        if (insertError) {
          throw new Error(
            `Failed to create free tier record: ${insertError.message}`,
          );
        }
      }

      const { data: voice, error: voiceError } = await supabase
        .from("brand_voices")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (voiceError || !voice)
        throw new Error("Please complete voice training first.");

      // 4. CREATE PENDING RECORD
      const { data: record, error: insertError } = await supabase
        .from("content_generations")
        .insert({
          user_id: user.id,
          voice_id: voice.id,
          source_url: inputMode === "url" ? inputValue : "",
          status: "pending",
          metadata: {
            input_mode: inputMode,
            topic: inputMode === "idea" ? inputValue : "",
            platforms: selectedPlatformsArray,
            platform_counts: activeCounts,
          },
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(`Database Error: ${insertError.message}`);
      }

      // 5. CALL SECURE API ROUTE
      const res = await fetch("/api/v1/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generationId: record.id,
          inputMode,
          inputValue,
          voiceId: voice.id,
          platforms: selectedPlatformsArray,
          platformCounts: activeCounts,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            `API rejected request. Check middleware or Inngest keys.`,
        );
      }

      return record.id;
    },
    onSuccess: (id) => {
      setGenerationId(id);
      setEngineState("processing");
      toast.info("Pipeline started", {
        description: "Analyzing input and aligning voice vectors...",
      });
    },
    onError: (error: Error) => {
      setEngineState("error");
      toast.error("Generation Failed", { description: error.message });
    },
  });

  useEffect(() => {
    if (engineState !== "processing" || !generationId) return;

    const channel = supabase
      .channel(`generation-${generationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "content_generations",
          filter: `id=eq.${generationId}`,
        },
        (payload) => {
          const { status, result_data, error_message } = payload.new;

          if (status === "completed") {
            setGeneratedData(result_data);
            setEngineState("completed");
            toast.success("Content Synthesized!", {
              description: "Your assets are ready for export.",
            });
            queryClient.invalidateQueries({
              queryKey: ["generations-history"],
            });
          } else if (status === "failed") {
            setEngineState("error");
            toast.error("Processing Failed", {
              description: error_message || "Grok encountered an error.",
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [engineState, generationId, supabase, queryClient]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (inputMode === "url" && !inputValue.startsWith("http")) {
      toast.error("Invalid URL", {
        description: "Please enter a valid website link.",
      });
      return;
    }

    if (selectedCount === 0) {
      toast.error("No outputs selected", {
        description: "Please select at least one platform to generate.",
      });
      return;
    }

    generateMutation.mutate();
  };

  const handleReset = () => {
    setEngineState("idle");
    setInputValue("");
    setGenerationId(null);
    setGeneratedData(null);
  };

  return {
    inputMode,
    setInputMode,
    inputValue,
    setInputValue,
    engineState,
    generatedData,
    platforms,
    togglePlatform,
    selectedCount,
    handleGenerate,
    handleReset,
    platformCounts,
    setPlatformCount,
  };
}
