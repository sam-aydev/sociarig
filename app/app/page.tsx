"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { RefreshCcw, AudioLines, Sparkles, CheckCircle } from "lucide-react";
import ExportWorkflows from "@/components/dashboard/ExportWorkflows";
import { useGenerator } from "@/app/lib/util/hooks/useGenerator";
import GeneratorForm from "@/components/dashboard/GeneratorForm";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING: object = {
  type: "spring",
  stiffness: 300,
  damping: 24,
  mass: 0.8,
};

export default function GeneratorPage() {
  const generatorProps = useGenerator();
  const { engineState, inputMode, generatedData, handleReset, isPending } =
    generatorProps;
  const reduceMotion = useReducedMotion();
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll down to the generated results beautifully
  useEffect(() => {
    if (engineState === "completed" && outputRef.current) {
      setTimeout(() => {
        outputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  }, [engineState]);

  return (
    <div className="relative w-full max-w-5xl mx-auto pb-24 min-h-[80vh]">
      <div className="absolute inset-0 -z-20 pointer-events-none overflow-hidden [mask-image:linear-gradient(to_bottom,white_20%,transparent_80%)]">
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-ink)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
        <motion.div
          animate={
            reduceMotion
              ? {}
              : {
                  scale: [1, 1.05, 1],
                  opacity: [0.4, 0.5, 0.4],
                }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-[100px]"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--color-signal) 20%, transparent), transparent)",
          }}
        />
      </div>

      <motion.header
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="mb-14 max-w-2xl relative z-10"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: EASE },
            },
          }}
          className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white/60 py-1.5 pl-2 pr-4 text-xs font-bold text-ink shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md"
        >
          <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-signal/15">
            {engineState === "processing" ? (
              <div className="absolute inset-0 rounded-full border border-signal border-t-transparent animate-spin" />
            ) : engineState === "completed" ? (
              <CheckCircle size={12} className="text-signal relative z-10" />
            ) : (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-signal/30 blur-sm"
              />
            )}
            {engineState !== "completed" && (
              <AudioLines size={12} className="text-signal relative z-10" />
            )}
          </div>
          Sociarig Synthesis Engine
        </motion.div>

        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: EASE },
            },
          }}
          className="font-display flex space-x-1.5 text-3xl md:text-4xl font-semibold text-ink tracking-tight mb-2"
        >
          Synthesize content.
          <Sparkles
            className="text-signal/50 hidden md:block"
            size={25}
            strokeWidth={1.5}
          />
        </motion.h1>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: EASE },
            },
          }}
          className="max-w-xl text-base leading-relaxed text-ink-soft md:text-lg"
        >
          Provide a source URL or a raw idea. Sociarig will inject your brand
          voice and architect the content perfectly for your selected platforms.
        </motion.p>
      </motion.header>

      <div className="relative">
        <motion.div
          animate={{
            filter:
              engineState === "processing"
                ? "blur(4px) saturate(0.5)"
                : "blur(0px) saturate(1)",
            opacity: engineState === "processing" ? 0.4 : 1,
            scale: engineState === "processing" ? 0.98 : 1,
          }}
          transition={SPRING}
          className="origin-top relative z-0"
        >
          <GeneratorForm {...generatorProps} />
        </motion.div>

        {/* Processing State Overlay */}
        <AnimatePresence>
          {engineState === "processing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              role="status"
              aria-live="polite"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[2rem] bg-paper-dim/30 backdrop-blur-sm"
            >
              <motion.div
                initial={
                  reduceMotion ? false : { opacity: 0, scale: 0.9, y: 10 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={SPRING}
                className="relative w-[min(90%,24rem)] overflow-hidden rounded-2xl border border-ink/10 bg-white/90 backdrop-blur-xl shadow-2xl shadow-ink/10"
              >
                <motion.div
                  className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
                <div className="relative z-10 flex items-center gap-5 px-6 py-5">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[3px] border-ink/5" />
                    <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-signal border-r-signal/30" />
                    <div className="h-2.5 w-2.5 rounded-full bg-signal shadow-[0_0_10px_var(--color-signal)] animate-pulse" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-bold text-ink tracking-wide">
                      Engine is working...
                    </span>
                    <span className="truncate text-xs font-medium text-ink-soft mt-0.5">
                      {inputMode === "url"
                        ? "Scraping content & aligning vectors"
                        : "Structuring idea & aligning vectors"}
                    </span>
                  </div>
                </div>
                <div className="relative h-1 w-full bg-ink/5 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 w-1/2 bg-signal shadow-[0_0_8px_var(--color-signal)] rounded-full"
                    animate={
                      reduceMotion ? undefined : { left: ["-50%", "100%"] }
                    }
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The Output Area */}
      <AnimatePresence>
        {engineState === "completed" && generatedData && (
          <motion.section
            ref={outputRef} // Used for auto-scrolling
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={SPRING}
            className="mt-6 sm:mt-16 space-y-8 relative z-10 scroll-mt-24" // scroll-mt offsets the header height when scrolling
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-ink/10 pt-10">
              <div>
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  className="h-1 w-12 bg-signal rounded-full mb-4"
                />
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
                  Generated Assets
                </h2>
                <p className="text-sm text-ink-soft mt-1">
                  Review, edit, and export your synthesized content.
                </p>
              </div>

              {/* Enhanced Reset Button at the bottom as a secondary option */}
              <button
                onClick={() => {
                  handleReset();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white px-5 py-2.5 text-sm font-bold text-ink shadow-sm transition-all hover:border-ink/20 hover:bg-paper hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 focus-visible:ring-offset-2 active:scale-95"
              >
                <RefreshCcw
                  size={16}
                  className="transition-transform duration-500 group-hover:-rotate-180 text-ink-soft group-hover:text-signal"
                />
                Start New Generation
              </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-ink/10 shadow-sm p-1">
              <ExportWorkflows content={generatedData} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
