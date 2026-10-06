"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

const steps = [
  { id: 0, label: "Input Video" },
  { id: 1, label: "Match Voice" },
  { id: 2, label: "Syndicate" },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  }),
};

export default function Hero() {
  const [activeStep, setActiveStep] = useState(0);

  // Custom timing loop to give users time to read the generated cards
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const runCycle = (currentState: number) => {
      let delay = 3000;
      if (currentState === 0)
        delay = 2500; // URL typing speed
      else if (currentState === 1)
        delay = 3500; // Processing simulation
      else if (currentState === 2) delay = 7500; // Time to read outputs

      timeoutId = setTimeout(() => {
        setActiveStep((prev) => (prev >= 2 ? 0 : prev + 1));
      }, delay);
    };

    runCycle(activeStep);
    return () => clearTimeout(timeoutId);
  }, [activeStep]);

  return (
    <section className="relative pt-30 pb-8 md:pt-32 md:pb-32 px-2 md:px-10 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150%] md:w-[100%] h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--color-signal)_0%,_transparent_50%)] opacity-[0.06] pointer-events-none" />

      <div className="max-w-[var(--container-content)] mx-auto flex flex-col items-center text-center relative z-10">
        {/* Headline Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 md:mb-8 rounded-full border border-ink/10 bg-white shadow-sm text-xs font-semibold tracking-wide uppercase text-ink-soft">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-900 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-700"></span>
            </span>
            The Sociarig Engine
          </div>

          <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-balance mb-6 md:mb-8">
            One Link. Endless Content. <br className="hidden md:block" />
            <span className="text-ink-faint">Your Exact Voice.</span>
          </h1>

          <p className="text-sm md:text-xl text-ink-soft max-w-2xl text-balance mb-7 md:mb-10">
            Drop a URL or idea. Sociarig instantly writes Twitter threads,
            LinkedIn posts, and newsletters that actually sound like you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/auth/signup"
              className="group inline-flex justify-center items-center gap-2 w-5/6 mx-auto md:w-full px-8 py-4 bg-black text-paper rounded-full font-medium hover:bg-green-700 transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(18,21,27,0.5)] hover:shadow-none hover:translate-y-[2px]"
            >
              Start Generating Free
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* The Interactive Demo Engine (Show, Don't Tell) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 w-full max-w-5xl"
        >
          <div className="rounded-2xl border border-ink/10 bg-white/50 backdrop-blur-xl shadow-[0_30px_60px_-15px_rgba(18,21,27,0.05)] p-4 md:p-8 min-h-[360px] flex flex-col relative overflow-hidden">
            {/* Engine Progress Bar */}
            <div className="flex items-center justify-between border-b border-ink/5 pb-4 mb-8">
              <div className="flex gap-2 text-xs md:text-sm font-medium">
                {steps.map((s) => (
                  <div
                    onClick={() => setActiveStep(s.id)}
                    key={s.id}
                    className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors duration-500 ${activeStep === s.id ? "bg-signal text-white" : activeStep > s.id ? "bg-signal/10 text-signal" : "text-ink-faint"}`}
                  >
                    <span className="hidden md:flex w-4 h-4 items-center justify-center rounded-full text-[10px] bg-white/20">
                      {s.id + 1}
                    </span>
                    {s.label}
                  </div>
                ))}
              </div>
              <div className="hidden md:flex gap-6 text-xs font-semibold tracking-wide uppercase text-ink-faint">
                <span className="flex items-center gap-1">
                  <span className="text-signal">✓</span> 0 Robotic Fluff
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-signal">✓</span> Brand Voice Matched
                </span>
              </div>
            </div>

            {/* Dynamic UI Area */}
            <div className="flex-1 flex items-center justify-center w-full">
              <AnimatePresence mode="wait">
                {/* State 0: URL Input */}
                {activeStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full max-w-2xl relative"
                  >
                    <div className="absolute inset-y-0 left-4 flex items-center text-signal">
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <div className="w-full bg-white border border-ink/10 shadow-sm rounded-xl py-5 pl-12 pr-4 text-base md:text-lg font-mono text-ink-soft flex items-center">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "linear" }}
                        className="overflow-hidden whitespace-nowrap block text-left"
                      >
                        https://youtube.com/watch?v=saas-growth-guide
                      </motion.span>
                      <span className="w-0.5 h-6 bg-signal animate-pulse ml-1" />
                    </div>
                  </motion.div>
                )}

                {/* State 1: Processing */}
                {activeStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="relative flex items-center justify-center w-20 h-20">
                      <div className="absolute inset-0 border-4 border-signal/20 rounded-full border-t-signal animate-spin" />
                      <div className="w-10 h-10 bg-signal rounded-full animate-pulse" />
                    </div>
                    <div className="text-center font-mono text-sm">
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-ink-soft"
                      >
                        [1/2] Transcribing with Deepgram...
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="text-signal mt-2 font-medium"
                      >
                        [2/2] Injecting Custom Brand Voice parameters...
                      </motion.p>
                    </div>
                  </motion.div>
                )}

                {/* State 2: Generated Output */}
                {activeStep === 2 && (
                  <motion.div
                    key="step2"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-full"
                  >
                    {/* Twitter Card */}
                    <motion.div
                      custom={0}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-white p-6 rounded-xl border border-ink/10 shadow-sm text-left flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-ink/5">
                        <div className="flex items-center gap-2 text-ink">
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="currentColor"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          <span className="text-sm font-bold">Thread</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold bg-signal/10 text-signal px-2 py-1 rounded">
                          Tone Match: 99%
                        </span>
                      </div>
                      <p className="text-sm text-ink leading-relaxed font-medium">
                        You don't need a 10-person marketing team.
                        <br />
                        <br />
                        Here is the exact AI pipeline we used to scale to
                        $50k/mo with zero employees:
                        <br />
                        <br />
                        (A Thread 🧵)
                      </p>
                    </motion.div>

                    {/* LinkedIn Card */}
                    <motion.div
                      custom={1}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-white p-6 rounded-xl border border-ink/10 shadow-sm text-left flex flex-col hidden md:flex"
                    >
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-ink/5">
                        <div className="flex items-center gap-2 text-ink">
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="currentColor"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          <span className="text-sm font-bold">
                            Carousel Draft
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold bg-signal/10 text-signal px-2 py-1 rounded">
                          Insight Heavy
                        </span>
                      </div>
                      <p className="text-sm text-ink leading-relaxed">
                        Most founders waste 10 hours a week on content creation.
                        <br />
                        <br />
                        We stopped doing that. Instead, we built an engine that
                        turns 1 Link into 30 days of distribution...
                      </p>
                    </motion.div>

                    {/* Email Card */}
                    <motion.div
                      custom={2}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-white p-6 rounded-xl border border-ink/10 shadow-sm text-left flex flex-col hidden md:flex"
                    >
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-ink/5">
                        <div className="flex items-center gap-2 text-ink">
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m2 4 10 8 10-8" />
                          </svg>
                          <span className="text-sm font-bold">Newsletter</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold bg-signal/10 text-signal px-2 py-1 rounded">
                          Ready to Send
                        </span>
                      </div>
                      <div className="mb-3">
                        <span className="text-xs text-ink-faint">Subject:</span>{" "}
                        <span className="text-sm font-bold text-ink">
                          The Omnipresence Framework
                        </span>
                      </div>
                      <p className="text-sm text-ink leading-relaxed">
                        Hey everyone,
                        <br />
                        <br />
                        This week, I want to break down exactly how we automated
                        our entire syndication pipeline to reach 100k views...
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
