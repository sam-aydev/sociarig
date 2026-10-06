"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { signUpUser } from "@/app/lib/util/actions/auth";
import Link from "next/link";
import { Mail } from "lucide-react"; // Import the Mail icon

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  // Track if they have successfully signed up
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Notice we are pulling 'message' instead of 'route'
      const { error, message, success }: any = await signUpUser(formData);

      if (error) {
        toast.error("Signup Failed", { description: error });
      } else if (success) {
        // Swap the UI to the "Check Email" state
        setIsSubmitted(true);
        toast.success("Account created successfully!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute w-[70%] max-w-[400px] aspect-square bg-ember blur-[100px] lg:blur-[120px] rounded-full opacity-5 -translate-x-1/3 translate-y-1/3"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,21,27,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,21,27,0.03)_1px,transparent_1px)] bg-[size:30px_30px] lg:bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center pt-24 md:pt-36 pb-8 px-4 lg:px-6 relative z-10 w-full min-h-[500px]">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px] bg-white border border-ink/10 rounded-2xl lg:rounded-[var(--radius-xl)] shadow-[0_20px_60px_-15px_rgba(18,21,27,0.08)] p-6 sm:p-8 lg:p-10 mx-auto"
        >
          <div className="text-center mb-8 space-y-1.5 lg:space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-3xl lg:text-4xl font-semibold tracking-tight text-ink">
              {isSubmitted ? "Check your inbox" : "Start generating"}
            </h1>
            <p className="text-ink-soft text-[13px] sm:text-sm lg:text-base px-2">
              {isSubmitted
                ? "We've sent a secure link to your email. Click it to activate your account."
                : "Create an account to scale your content."}
            </p>
          </div>

          {isSubmitted ? (
            <div className="flex flex-col items-center pb-4">
              <div className="w-16 h-16 bg-signal/10 rounded-full flex items-center justify-center text-signal mb-6">
                <Mail size={32} />
              </div>
              <button
                onClick={() => (window.location.href = "mailto:")}
                className="w-full cursor-pointer py-3.5 bg-ink text-paper rounded-lg lg:rounded-xl font-medium text-[13px] lg:text-sm transition-all hover:bg-ink-soft shadow-lg active:scale-[0.98] flex items-center justify-center"
              >
                Open Email App
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 lg:space-y-5 w-full"
            >
              <div className="space-y-4 w-full">
                <div className="space-y-1.5 w-full">
                  <label className="text-[13px] lg:text-sm font-medium text-ink block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    required
                    className="w-full px-3.5 py-3 lg:px-4 lg:py-3.5 bg-paper-dim/30 border border-ink/10 rounded-lg lg:rounded-xl text-[13px] lg:text-sm focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal transition-all shadow-sm placeholder:text-ink-faint"
                  />
                </div>

                <div className="space-y-1.5 w-full">
                  <label className="text-[13px] lg:text-sm font-medium text-ink block">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-3.5 py-3 lg:px-4 lg:py-3.5 bg-paper-dim/30 border border-ink/10 rounded-lg lg:rounded-xl text-[13px] lg:text-sm focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal transition-all shadow-sm placeholder:text-ink-faint"
                  />
                </div>

                <div className="space-y-1.5 w-full">
                  <label className="text-[13px] lg:text-sm font-medium text-ink block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-3.5 py-3 lg:px-4 lg:py-3.5 bg-paper-dim/30 border border-ink/10 rounded-lg lg:rounded-xl text-[13px] lg:text-sm focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal transition-all shadow-sm placeholder:text-ink-faint"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer py-3.5 mt-2 bg-ink text-paper rounded-lg lg:rounded-xl font-medium text-[13px] lg:text-sm transition-all hover:bg-ink-soft hover:shadow-lg hover:shadow-ink/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <span className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                ) : (
                  "Create Free Account"
                )}
              </button>
            </form>
          )}

          {!isSubmitted && (
            <>
              <div className="mt-6 pt-5 border-t border-ink/5">
                <p className="text-center text-[11px] lg:text-xs text-ink-faint leading-relaxed px-2">
                  Protected by enterprise-grade encryption. By continuing, you
                  agree to our{" "}
                  <Link href="/terms" className="text-ink hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-ink hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <div className="mt-4 text-center text-sm text-ink-soft">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-green-700 font-medium hover:underline"
                >
                  Log in
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
