"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Mail,
  Plus,
} from "lucide-react";
import { FaInstagram, FaLinkedin, FaTwitter, FaThreads } from "react-icons/fa6";
import { toast } from "sonner";
import type { InputMode, EngineState } from "@/app/lib/util/hooks/useGenerator";

interface GeneratorFormProps {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  engineState: EngineState;

  platforms: {
    twitter: boolean;
    threads: boolean;
    linkedin: boolean;
    instagram: boolean;
    newsletter: boolean;
  };
  togglePlatform: (key: keyof GeneratorFormProps["platforms"]) => void;

  platformCounts: Record<keyof GeneratorFormProps["platforms"], number>;
  setPlatformCount: (
    key: keyof GeneratorFormProps["platforms"],
    count: number,
  ) => void;

  selectedCount: number;
  handleGenerate: (e: React.FormEvent) => void;
  handleReset: () => void; // Added for the reset overlay
}

const PLATFORM_CONFIG = [
  { id: "twitter", label: "X (Twitter)", icon: FaTwitter },
  { id: "threads", label: "Threads", icon: FaThreads },
  { id: "linkedin", label: "LinkedIn", icon: FaLinkedin },
  { id: "instagram", label: "Instagram", icon: FaInstagram },
  { id: "newsletter", label: "Newsletter", icon: Mail },
] as const;

const isUrl = (str: string) => {
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
  return urlPattern.test(str.trim());
};

export default function GeneratorForm(props: GeneratorFormProps) {
  const {
    inputMode,
    setInputMode,
    inputValue,
    setInputValue,
    engineState,
    platforms,
    togglePlatform,
    platformCounts,
    setPlatformCount,
    selectedCount,
    handleGenerate,
    handleReset,
  } = props;

  // Local lock to cover the microsecond gap before React Query switches engineState to 'processing'
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  // Auto-unlock if the engine resets or errors out
  useEffect(() => {
    if (engineState === "idle" || engineState === "error") {
      setIsSubmittingLocal(false);
    }
  }, [engineState]);

  const isBusy =
    engineState === "processing" ||
    engineState === "completed" ||
    isSubmittingLocal;

  const handleModeSwitch = (mode: InputMode) => {
    if (mode !== inputMode) {
      setInputValue("");
    }
    setInputMode(mode);
  };

  const safeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isBusy) return;

    if (inputMode === "idea" && isUrl(inputValue)) {
      toast.error("Invalid Input", {
        description:
          "It looks like you pasted a link. Please switch to 'Repurpose a Link' mode.",
      });
      return;
    }

    // Immediately lock the UI
    setIsSubmittingLocal(true);
    handleGenerate(e);
  };

  return (
    <motion.div
      layout
      className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl sm:rounded-[2rem] p-2 sm:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 sm:mb-10 relative overflow-hidden ring-1 ring-ink/5"
    >
      {/* SUCCESS OVERLAY: Covers the form beautifully when completed */}
      <AnimatePresence>
        {engineState === "completed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md rounded-3xl sm:rounded-[2rem]"
          >
            <div className="w-16 h-16 bg-signal/10 rounded-full flex items-center justify-center mb-4 text-signal">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-display text-2xl font-bold text-ink mb-2">
              Generation Complete
            </h3>
            <p className="text-ink-soft text-sm mb-6 text-center max-w-xs">
              Your assets have been synthesized successfully. Scroll down to
              view them.
            </p>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl font-bold text-sm hover:bg-ink-soft transition-colors shadow-lg active:scale-95"
            >
              <Plus size={16} /> Create Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex p-1 sm:p-1.5 bg-ink/5 rounded-[1rem] sm:rounded-2xl relative z-10 mb-4 sm:mb-4 mx-1">
        {(["url", "idea"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => handleModeSwitch(mode)}
            disabled={isBusy}
            className="flex-1 relative py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer outline-none disabled:opacity-50"
          >
            {inputMode === mode && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-ink/5"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-1.5 sm:gap-2 ${inputMode === mode ? "text-ink" : "text-ink-soft hover:text-ink"}`}
            >
              {mode === "url" ? (
                <Link2 className="w-4 h-4 sm:w-4 sm:h-4" />
              ) : (
                <Lightbulb className="w-4 h-4 sm:w-4 sm:h-4" />
              )}
              {mode === "url" ? "Repurpose a Link" : "Start from an Idea"}
            </span>
          </button>
        ))}
      </div>

      <form
        onSubmit={safeSubmit}
        className="relative z-10 bg-paper/40 rounded-2xl sm:rounded-[1.5rem] border border-white p-4 sm:p-6 md:p-8 shadow-inner"
      >
        <div className="mb-8 sm:mb-10">
          {inputMode === "url" ? (
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 sm:left-5 flex items-center pointer-events-none text-ink-faint transition-colors group-focus-within:text-signal">
                <Link2 className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={2.5} />
              </div>
              <input
                type="url"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste a YouTube, Blog, or Social link..."
                disabled={isBusy}
                required
                className="w-full pl-11 sm:pl-14 pr-4 sm:pr-5 py-2 bg-white border border-ink/10 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-signal/10 focus:border-signal transition-all placeholder:text-ink-faint disabled:opacity-50 font-mono shadow-sm"
              />
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute top-4 sm:top-5 left-4 sm:left-5 pointer-events-none text-ink-faint transition-colors group-focus-within:text-signal">
                <Lightbulb
                  className="w-5 h-5 sm:w-5 sm:h-5"
                  strokeWidth={2.5}
                />
              </div>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What do you want to talk about? (e.g. 'I want to share 3 lessons I learned about scaling SaaS...')"
                disabled={isBusy}
                required
                rows={4}
                className="w-full pl-11 sm:pl-14 pr-4 sm:pr-5 py-4 sm:py-4 bg-white border border-ink/10 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-signal/10 focus:border-signal transition-all placeholder:text-ink-faint disabled:opacity-50 resize-none shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <label className="block text-[10px] sm:text-xs font-extrabold text-ink-soft uppercase tracking-widest">
              Select Deliverables & Volume
            </label>
            <span className="text-[10px] sm:text-xs font-bold text-signal bg-signal/10 px-2.5 sm:px-3 py-1 rounded-full">
              {selectedCount} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {PLATFORM_CONFIG.map((platform) => {
              const Icon = platform.icon;
              const isSelected =
                platforms?.[platform?.id as keyof typeof platforms];
              const currentCount =
                platformCounts?.[platform?.id as keyof typeof platformCounts] ||
                1;

              return (
                <motion.div
                  layout
                  key={platform.id}
                  className={`relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-gradient-to-b from-signal/5 to-transparent border-signal/30 shadow-md ring-1 ring-signal/10"
                      : "bg-white border-ink/10 hover:border-ink/20 shadow-sm"
                  }`}
                >
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      togglePlatform(platform.id as keyof typeof platforms)
                    }
                    className="w-full flex items-center justify-between p-3 sm:p-4 cursor-pointer outline-none disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors ${isSelected ? "bg-signal text-white shadow-lg shadow-signal/30" : "bg-paper text-ink-soft"}`}
                      >
                        <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                      </div>
                      <span
                        className={`font-bold text-xs sm:text-sm ${isSelected ? "text-ink" : "text-ink-soft"}`}
                      >
                        {platform.label}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-signal bg-signal text-white" : "border-ink/20 bg-transparent text-transparent"}`}
                    >
                      <CheckCircle2
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                        strokeWidth={3}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1 border-t border-signal/10 mx-3 sm:mx-4">
                          <p className="text-[9px] sm:text-[10px] font-bold text-signal/70 uppercase tracking-widest mb-2.5">
                            Variations to Generate
                          </p>
                          <div className="flex relative bg-black/5 rounded-[0.6rem] sm:rounded-xl p-1 shadow-inner">
                            {[1, 2, 3].map((num) => (
                              <button
                                key={num}
                                type="button"
                                disabled={isBusy}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPlatformCount(
                                    platform.id as keyof typeof platformCounts,
                                    num,
                                  );
                                }}
                                className="flex-1 relative z-10 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-center outline-none disabled:cursor-not-allowed"
                              >
                                {currentCount === num && (
                                  <motion.div
                                    layoutId={`slider-${platform.id}`}
                                    className="absolute inset-0 bg-white rounded-[0.4rem] sm:rounded-lg shadow-sm border border-ink/5"
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 30,
                                    }}
                                  />
                                )}
                                <span
                                  className={`relative z-20 transition-colors ${currentCount === num ? "text-signal" : "text-ink-soft hover:text-ink"}`}
                                >
                                  {num}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <motion.button
            whileHover={{ scale: selectedCount > 0 && !isBusy ? 1.01 : 1 }}
            whileTap={{ scale: selectedCount > 0 && !isBusy ? 0.98 : 1 }}
            type="submit"
            disabled={isBusy || selectedCount === 0}
            className="w-full py-3 sm:py-4 bg-ink text-paper rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all shadow-xl shadow-ink/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 sm:gap-3 cursor-pointer group"
          >
            <Sparkles
              className={`w-4 h-4 sm:w-5 sm:h-5 text-signal ${isBusy ? "animate-pulse" : "group-hover:rotate-12 transition-transform"}`}
            />
            {isBusy ? "Processing Engine..." : "Produce Content"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
