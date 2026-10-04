"use client";

import { motion } from "framer-motion";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePasswordRecovery } from "@/app/lib/util/hooks/usePasswordRecovery";

export default function Page() {
  const { isLoading, isSent, setIsSent, handleResetRequest } = usePasswordRecovery();

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
              Reset your password
            </h1>
            <p className="text-ink-soft text-[13px] sm:text-sm px-2">
              {isSent 
                ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."
                : "Enter the email address associated with your account and we'll send you a link to reset your password."}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleResetRequest} className="space-y-5 w-full">
              <div className="space-y-1.5 w-full">
                <label className="text-[13px] lg:text-sm font-medium text-ink block">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  className="w-full px-3.5 py-3 bg-paper-dim/30 border border-ink/10 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal transition-all shadow-sm placeholder:text-ink-faint"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer py-3.5 bg-ink text-paper rounded-xl font-medium text-[13px] transition-all hover:bg-ink-soft hover:shadow-lg active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsSent(false)}
              className="w-full py-3.5 cursor-pointer bg-paper-dim border border-ink/10 text-ink rounded-xl font-medium text-[13px] hover:bg-paper transition-all"
            >
              Try another email
            </button>
          )}

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors font-medium">
              <ArrowLeft size={16} /> Back to log in
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}