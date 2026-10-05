"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  AlertCircle,
} from "lucide-react";
import { useOnboarding } from "@/app/lib/util/hooks/useOnboarding";
import { signOutUser } from "@/app/lib/util/actions/auth";

export default function OnboardingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploadedFiles,
    isProcessing,
    isLoading,
    isComplete,
    validFileCount,
    handleFileUpload,
    isError,
    queryErrorMsg,
    completeOnboarding,
    isFinishing,
  } = useOnboarding();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-ink/10 border-t-signal rounded-full animate-spin" />
      </div>
    );
  }

  // Catch the missing voice error and force them to log out
  if (isError) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center z-50 relative">
        <div className="w-16 h-16 bg-ember/10 text-ember rounded-2xl flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink mb-3">
          Workspace Error
        </h1>
        <p className="text-ink-soft mb-8 max-w-md leading-relaxed">
          {queryErrorMsg || "Failed to load voice profile."}
        </p>
        <button
          onClick={() => {
            signOutUser();
            window.location.href = "/auth";
          }}
          className="px-6 py-3 bg-ink text-paper rounded-xl font-medium transition-all hover:bg-ink-soft"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 relative overflow-hidden z-50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-signal/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white border border-ink/10 rounded-[2rem] p-8 md:p-12 shadow-xl relative z-10"
      >
        <div className="w-12 h-12 bg-signal/10 text-signal rounded-2xl flex items-center justify-center mb-6">
          <BrainCircuit size={24} />
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-3 tracking-tight">
          Train your digital twin.
        </h1>
        <p className="text-ink-soft text-base mb-8 leading-relaxed">
          To generate content that actually sounds like you, Fractal needs
          reference material. Upload strictly 3 of your best past newsletters,
          blog posts, or LinkedIn threads.
        </p>

        {/* Upload Dropzone */}
        <div
          onClick={() =>
            !isProcessing && validFileCount < 3 && fileInputRef.current?.click()
          }
          className={`bg-paper-dim/30 border-2 border-dashed border-ink/15 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors mb-8 ${isProcessing || validFileCount >= 3 ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-paper-dim/50 hover:border-signal/50 group"}`}
        >
          <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud size={24} className="text-signal" />
          </div>
          <h3 className="text-base font-semibold text-ink mb-1">
            {validFileCount >= 3
              ? "Training Data Complete"
              : "Select files to upload"}
          </h3>
          <p className="text-sm text-ink-faint">
            PDF, DOCX, or TXT (Max 10MB each)
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.value = "";
            }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files);
              }
            }}
            accept=".txt, .pdf, .docx, text/plain, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            className="hidden"
          />
        </div>

        {/* Upload Progress List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3 mb-8 max-h-[200px] overflow-y-auto pr-2">
            <AnimatePresence>
              {uploadedFiles.map((file, i) => (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  key={`${file.name}-${i}`}
                  className={`flex items-center justify-between p-3 border rounded-xl ${file.status === "error" ? "bg-ember/5 border-ember/20" : "bg-paper-dim/30 border-ink/5"}`}
                >
                  <div className="flex flex-col truncate pr-4">
                    <span
                      className={`text-sm font-medium truncate ${file.status === "error" ? "text-ember" : "text-ink"}`}
                    >
                      {file.name}
                    </span>
                    {file?.errorMsg && (
                      <span className="text-xs text-ember/80 mt-0.5">
                        {file.errorMsg}
                      </span>
                    )}
                  </div>

                  {file.status === "processing" && (
                    <div className="w-4 h-4 border-2 border-ink/20 border-t-signal rounded-full animate-spin shrink-0" />
                  )}
                  {file.status === "done" && (
                    <CheckCircle2 size={16} className="text-signal shrink-0" />
                  )}
                  {file.status === "error" && (
                    <AlertCircle size={16} className="text-ember shrink-0" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={completeOnboarding}
          disabled={!isComplete || isFinishing}
          className="w-full py-4 bg-ink text-paper rounded-xl font-medium text-base transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {isFinishing ? (
            <div className="w-5 h-5 border-2 border-paper/30 border-t-paper rounded-full animate-spin shrink-0" />
          ) : isComplete ? (
            "Enter Workspace"
          ) : (
            `Upload ${Math.max(0, 3 - validFileCount)} more file${3 - validFileCount === 1 ? "" : "s"}`
          )}

          {isComplete && !isFinishing && (
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          )}
        </button>
      </motion.div>
    </div>
  );
}
