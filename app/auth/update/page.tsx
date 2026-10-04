"use client";

import { motion } from "framer-motion";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { usePasswordRecovery } from "@/app/lib/util/hooks/usePasswordRecovery";

export default function Page() {
  const { isLoading, handlePasswordUpdate } = usePasswordRecovery();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-paper text-ink font-sans relative overflow-hidden">
      <div className="z-50 shrink-0">
        <Nav />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[80%] max-w-[500px] aspect-square bg-signal blur-[100px] lg:blur-[120px] rounded-full opacity-10 translate-x-1/4 -translate-y-1/4"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,21,27,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,21,27,0.03)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 md:pt-36 pb-8 px-4 lg:px-6 relative z-10 w-full min-h-[500px]">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px] bg-white border border-ink/10 rounded-2xl shadow-[0_20px_60px_-15px_rgba(18,21,27,0.08)] p-6 sm:p-8 lg:p-10 mx-auto"
        >
          <div className="text-center mb-8 space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              Secure your account
            </h1>
            <p className="text-ink-soft text-[13px] sm:text-sm px-2">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-5 w-full">
            <div className="space-y-4 w-full">
              <div className="space-y-1.5 w-full">
                <label className="text-[13px] lg:text-sm font-medium text-ink block">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-3 bg-paper-dim/30 border border-ink/10 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal transition-all shadow-sm placeholder:text-ink-faint"
                />
              </div>

              <div className="space-y-1.5 w-full">
                <label className="text-[13px] lg:text-sm font-medium text-ink block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-3 bg-paper-dim/30 border border-ink/10 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal transition-all shadow-sm placeholder:text-ink-faint"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer py-3.5 mt-2 bg-ink text-paper rounded-xl font-medium text-[13px] transition-all hover:bg-ink-soft hover:shadow-lg active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}