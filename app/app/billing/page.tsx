"use client";

import { motion } from "framer-motion";
import { Zap, Settings, Diamond } from "lucide-react";
import { useBilling } from "@/app/lib/util/hooks/useBilling";
import { format } from "date-fns";

// Ensure these match your exact Lemon Squeezy Variant IDs
const STARTER_VARIANT_ID = 2189842;
const PREMIUM_VARIANT_ID = 2189848;

export default function BillingPage() {
  const {
    subscription,
    isLoading,
    upgrade,
    isRedirecting,
    manageSubscription,
  } = useBilling();

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-ink/10 border-t-signal rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Determine the Current Plan
  const activeSubName =
    subscription?.status === "active"
      ? subscription?.name?.toLowerCase()
      : "free";

  let currentPlan = "free";
  if (activeSubName?.includes("starter")) currentPlan = "starter";
  if (activeSubName?.includes("premium")) currentPlan = "premium";

  // 2. Map Plan Details & Define the "Next Plan"
  let planName = "Free Plan";
  let price = "$0.00 USD";
  let fallbackMaxGens = 5;
  let nextPlan: {
    name: string;
    price: string;
    description: string;
    variantId: number;
    icon: React.ElementType;
  } | null = null;

  if (currentPlan === "free") {
    planName = "Free Plan";
    price = "$0.00 USD";
    fallbackMaxGens = 5;
    nextPlan = {
      name: "Starter",
      price: "$19.00",
      description:
        "Upgrade to Starter for 150 generations/mo, 5 brand voices, and high-priority processing.",
      variantId: STARTER_VARIANT_ID,
      icon: Zap,
    };
  } else if (currentPlan === "starter") {
    planName = "Starter Plan";
    price = "$19.00 USD";
    fallbackMaxGens = 150;
    nextPlan = {
      name: "Premium",
      price: "$49.00",
      description:
        "Upgrade to Premium for 500 generations/mo, 15 brand voices, and team collaboration.",
      variantId: PREMIUM_VARIANT_ID,
      icon: Diamond,
    };
  } else if (currentPlan === "premium") {
    planName = "Premium Plan";
    price = "$49.00 USD";
    fallbackMaxGens = 500;
    // Hide the upgrade card completely if they are already on the highest tier
    nextPlan = null;
  }

  const hasPaidPlan = currentPlan !== "free";
  const maxGens = subscription?.max_generations || fallbackMaxGens;
  const usedGens = subscription?.generations_used || 0;
  const usagePercentage = Math.min(100, (usedGens / maxGens) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink tracking-tight mb-2">
          Billing & Usage
        </h1>
        <p className="text-ink-soft">
          Manage your subscription, credits, and payment methods via Lemon
          Squeezy.
        </p>
      </div>

      <div
        className={`grid grid-cols-1 ${nextPlan ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}
      >
        {/* Current Plan Overview */}
        <div
          className={`${nextPlan ? "md:col-span-2" : "md:col-span-2 max-w-2xl"} bg-white border border-ink/10 rounded-2xl p-6 md:p-8 shadow-sm`}
        >
          <div className="flex flex-col sm:flex-row items-start justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-md bg-signal/10 border border-signal/20 text-[10px] font-extrabold tracking-widest uppercase text-signal">
                Current Plan
              </div>
              <h2 className="text-2xl font-bold text-ink">{planName}</h2>
              <p className="text-sm font-medium text-ink-soft mt-1">
                {price} / month
              </p>
            </div>

            {hasPaidPlan && (
              <button
                onClick={manageSubscription}
                className="px-5 py-2.5 bg-paper text-ink rounded-xl font-bold text-sm transition-all hover:bg-white border border-ink/10 shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Settings size={16} /> Manage Billing
              </button>
            )}
          </div>

          <div className="space-y-3 p-5 bg-paper-dim/30 border border-ink/5 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-ink">
                Monthly Content Generations
              </span>
              <span className="font-extrabold text-ink">
                {usedGens} / {maxGens}{" "}
                <span className="font-medium text-ink-soft">used</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-paper rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${usagePercentage > 90 ? "bg-red-700" : "bg-linear-to-r from-signal to-red-700"}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <p className="text-[11px] font-medium text-ink-faint uppercase tracking-wider pt-1">
              {subscription?.renews_at
                ? `Credits reset on ${format(new Date(subscription.renews_at), "MMM d, yyyy")}`
                : "Credits reset monthly"}
            </p>
          </div>
        </div>

        {/* Dynamic Upgrade Card */}
        {nextPlan && (
          <div className="bg-black text-paper rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-ink/10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-signal/20 blur-[50px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5 backdrop-blur-sm border border-white/10">
                <nextPlan.icon size={24} className="text-signal" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Ready for {nextPlan.name}?
              </h3>
              <p className="text-sm font-medium text-paper-dim/80 mb-8 leading-relaxed">
                {nextPlan.description}
              </p>
            </div>

            <button
              onClick={() => upgrade(nextPlan.variantId)}
              disabled={isRedirecting}
              className="w-full cursor-pointer p-3 bg-signal text-white rounded-xl font-bold text-sm transition-all hover:bg-signal/90 active:scale-[0.98] shadow-lg shadow-signal/20 disabled:opacity-50"
            >
              {isRedirecting
                ? "Preparing Checkout..."
                : `Upgrade to ${nextPlan.name}`}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
