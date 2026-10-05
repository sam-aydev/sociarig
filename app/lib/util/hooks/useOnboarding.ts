import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/app/lib/util/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type UploadedFile = {
  name: string;
  status: "processing" | "done" | "error";
  errorMsg?: string;
};

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = ["txt", "pdf", "docx"];
const MAX_FILES = 3; // Enforce strict 3 file limit

export function useOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [localUploadQueue, setLocalUploadQueue] = useState<UploadedFile[]>([]);

  // 1. Fetch Server Data
  const {
    data: serverData,
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["onboarding", "voice-docs"],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("UNAUTHORIZED");
      }

      const { data: voice, error: voiceError } = await supabase
        .from("brand_voices")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (voiceError) throw new Error(voiceError.message);
      if (!voice) {
        throw new Error(
          "Brand voice profile not found. Please log out and sign up again.",
        );
      }

      const { data: docs, error: docsError } = await supabase
        .from("voice_documents")
        .select("file_name, status")
        .eq("voice_id", voice.id);

      if (docsError) throw new Error(docsError.message);

      return {
        voiceId: voice.id,
        docs: (docs || []).map((doc) => ({
          name: doc.file_name,
          status: (doc.status === "completed"
            ? "done"
            : "processing") as UploadedFile["status"],
          errorMsg: undefined,
        })),
      };
    },
    retry: false,
  });

  useEffect(() => {
    if (error?.message === "UNAUTHORIZED") {
      router.push("/auth");
    }
  }, [error, router]);

  // 2. Realtime Listener for Background Inngest Processing
  useEffect(() => {
    if (!serverData?.voiceId) return;

    const channel = supabase
      .channel(`voice-docs-${serverData.voiceId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "voice_documents",
          filter: `voice_id=eq.${serverData.voiceId}`,
        },
        (payload) => {
          const { file_name, status, error_message } = payload.new;

          toast.dismiss(`upload-${file_name}`);

          if (status === "completed") {
            toast.success(`Processed ${file_name}`);
          } else if (status === "failed") {
            toast.error(`Failed to process ${file_name}`, {
              description: error_message || "Embedding generation failed",
            });
          }

          queryClient.invalidateQueries({
            queryKey: ["onboarding", "voice-docs"],
          });

          setLocalUploadQueue((prev) =>
            prev.filter((f) => f.name !== file_name),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [serverData?.voiceId, supabase, queryClient]);

  // 3. Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, voiceId }: { file: File; voiceId: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("voiceId", voiceId);

      const res = await fetch("/api/v1/voices", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Upload server error (${res.status}). Please try again.`,
        );
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      return { data, file };
    },
    onSuccess: (_, { file }) => {
      queryClient.invalidateQueries({ queryKey: ["onboarding", "voice-docs"] });

      toast.info(`Uploaded ${file.name}`, {
        id: `upload-${file.name}`,
        description: "Vector training running in background...",
        duration: 30000,
      });
    },
    onError: (err: Error, { file }) => {
      setLocalUploadQueue((prev) =>
        prev.map((f) =>
          f.name === file.name
            ? { ...f, status: "error", errorMsg: err.message }
            : f,
        ),
      );

      toast.error(`Failed to upload ${file.name}`, {
        description: err.message,
      });
    },
  });

  // 4. File Handler with Client Validation & Strict Limit
  const handleFileUpload = (files: FileList | null) => {
    if (!serverData?.voiceId) {
      toast.error("Workspace is still initializing. Please wait a second.");
      return;
    }
    if (!files || files.length === 0) return;

    // Calculate available slots based on currently valid files (ignoring errors)
    const serverDocs = serverData?.docs || [];
    const pendingLocal = localUploadQueue.filter(
      (local) =>
        !serverDocs.some((d) => d.name === local.name) ||
        local.status === "error",
    );
    const combinedFiles = [...serverDocs, ...pendingLocal];
    const currentValidCount = combinedFiles.filter(
      (f) => f.status !== "error",
    ).length;

    const availableSlots = MAX_FILES - currentValidCount;

    if (availableSlots <= 0) {
      toast.error("Upload limit reached", {
        description: `You can only upload a maximum of ${MAX_FILES} files.`,
      });
      return;
    }

    const fileArray = Array.from(files);
    const existingNames = new Set(combinedFiles.map((f) => f.name));
    const validNewFiles: File[] = [];

    for (const file of fileArray) {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`Invalid format: ${file.name}`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`File too large: ${file.name}`);
        continue;
      }

      if (existingNames.has(file.name)) {
        toast.info(`Already added: ${file.name}`);
        continue;
      }

      validNewFiles.push(file);
    }

    if (validNewFiles.length === 0) return;

    // Truncate to available slots
    const filesToUpload = validNewFiles.slice(0, availableSlots);
    if (filesToUpload.length < validNewFiles.length) {
      toast.info(
        `Only ${availableSlots} file(s) were added to strictly maintain the limit of ${MAX_FILES}.`,
      );
    }

    const newQueueEntries: UploadedFile[] = filesToUpload.map((f) => ({
      name: f.name,
      status: "processing", // Setting this triggers the loader
    }));

    setLocalUploadQueue((prev) => [...prev, ...newQueueEntries]);

    filesToUpload.forEach((file) => {
      uploadMutation.mutate({ file, voiceId: serverData.voiceId });
    });
  };

  // 5. Deduplicated Merge for UI Display
  const uploadedFiles = useMemo(() => {
    const serverDocs = serverData?.docs || [];
    const serverDocNames = new Set(serverDocs.map((d) => d.name));

    const pendingLocal = localUploadQueue.filter(
      (local) => !serverDocNames.has(local.name) || local.status === "error",
    );

    return [...serverDocs, ...pendingLocal];
  }, [serverData?.docs, localUploadQueue]);

  const validFileCount = uploadedFiles.filter(
    (f) => f.status !== "error",
  ).length;

  // Loader logic automatically drops to `false` if an upload errors out.
  const isProcessing =
    uploadMutation.isPending ||
    uploadedFiles.some((f) => f.status === "processing");

  // Must be EXACTLY 3 files to complete
  const isComplete = validFileCount === MAX_FILES && !isProcessing;

  // 6. Complete Onboarding Mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async (voiceId: string) => {
      const { error } = await supabase
        .from("brand_voices")
        .update({ is_onboarded: true })
        .eq("id", voiceId);

      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      router.push("/app");
      toast.success("Identity profile created!", {
        description: "Redirecting to workspace...",
      });
    },
    onError: (err) => {
      toast.error("Failed to finalize setup", {
        description: err.message,
      });
    },
  });

  const completeOnboarding = () => {
    if (isComplete && serverData?.voiceId) {
      completeOnboardingMutation.mutate(serverData.voiceId);
    }
  };

  return {
    uploadedFiles,
    isProcessing,
    isLoading: isQueryLoading,
    isError,
    queryErrorMsg: error?.message,
    isComplete,
    validFileCount,
    handleFileUpload,
    completeOnboarding,
    isFinishing: completeOnboardingMutation.isPending,
  };
}
