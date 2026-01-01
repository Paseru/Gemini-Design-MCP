"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  CreditCard,
  Zap,
  Check,
  ArrowUpRight,
  Crown,
  Sparkles,
} from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tokens: 30_000,
    features: ["30K tokens/month", "Basic support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    tokens: 500_000,
    features: [
      "500K tokens/month",
      "Priority support",
      "Usage analytics",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 79,
    tokens: 3_000_000,
    features: [
      "3M tokens/month",
      "Dedicated support",
      "Advanced analytics",
      "Custom integrations",
    ],
  },
];

const CREDIT_PACKS = [
  { id: "starter", name: "Starter", tokens: 50_000, price: 5 },
  { id: "standard", name: "Standard", tokens: 250_000, price: 20 },
  { id: "bulk", name: "Bulk", tokens: 750_000, price: 50 },
];

export default function BillingPage() {
  const subscription = useQuery(api.queries.subscriptions.getCurrent);
  const credits = useQuery(api.queries.users.getCredits);
  const createCheckout = useAction(api.actions.stripe.createCheckoutSession);
  const purchaseCredits = useAction(api.actions.stripe.purchaseCredits);
  const createPortal = useAction(api.actions.stripe.createPortalSession);

  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (tier: "pro" | "enterprise") => {
    setLoading(tier);
    try {
      const url = await createCheckout({ tier });
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleBuyCredits = async (pack: "starter" | "standard" | "bulk") => {
    setLoading(pack);
    try {
      const url = await purchaseCredits({ package: pack });
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Purchase error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading("portal");
    try {
      const url = await createPortal();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setLoading(null);
    }
  };

  const usagePercentage = subscription?.percentUsed ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-16">
      {/* Header */}
      <header className="flex items-end justify-between border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-4xl font-extralight tracking-tighter text-zinc-100 mb-2">
            Billing & Plans
          </h1>
          <p className="text-zinc-500 font-light">
            Manage your subscription and purchase credits
          </p>
        </div>
        {subscription && subscription.tier !== "free" && (
          <button
            onClick={handleManageBilling}
            disabled={loading === "portal"}
            className="h-11 px-5 flex items-center gap-2 text-xs bg-zinc-100 hover:bg-white text-zinc-950 transition-colors uppercase tracking-widest rounded font-medium"
          >
            <CreditCard size={14} />
            {loading === "portal" ? "Loading..." : "Manage Billing"}
          </button>
        )}
      </header>

      {/* Current Plan */}
      <section className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 flex items-center justify-center bg-zinc-100 text-zinc-950 rounded-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                  Current Plan
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-widest font-medium rounded">
                  {subscription?.tier || "free"}
                </span>
              </div>
              <p className="text-sm text-zinc-400 font-light">
                {subscription?.remaining?.toLocaleString() || 0} tokens remaining this period
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Period Ends</p>
            <p className="text-lg font-light text-zinc-100">
              {subscription?.periodEnd
                ? new Date(subscription.periodEnd).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
            <span>{subscription?.used?.toLocaleString() || 0} used</span>
            <span>{subscription?.quota?.toLocaleString() || 0} total</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 overflow-hidden rounded-full">
            <div
              className="h-full bg-zinc-100 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </section>

      {/* Plans */}
      <section>
        <h2 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-8">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-zinc-950 border p-8 flex flex-col transition-all duration-300 rounded-lg ${
                plan.popular
                  ? "border-zinc-100 shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-zinc-100 text-zinc-950 text-[10px] font-medium uppercase tracking-widest rounded">
                  Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                {plan.id === "enterprise" ? (
                  <Crown size={18} className="text-amber-400" />
                ) : plan.id === "pro" ? (
                  <Sparkles size={18} className="text-zinc-400" />
                ) : (
                  <Zap size={18} className="text-zinc-600" />
                )}
                <h3 className="text-sm font-medium text-zinc-100 uppercase tracking-widest">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extralight text-zinc-100">
                  ${plan.price}
                </span>
                <span className="text-sm text-zinc-500 ml-1">/month</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-zinc-400 font-light"
                  >
                    <Check size={14} className="text-zinc-100" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <button
                  disabled
                  className="w-full h-11 text-xs bg-zinc-800 text-zinc-500 uppercase tracking-widest cursor-not-allowed rounded"
                >
                  {subscription?.tier === "free" ? "Current Plan" : "Downgrade via Portal"}
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id as "pro" | "enterprise")}
                  disabled={
                    loading === plan.id || subscription?.tier === plan.id
                  }
                  className={`w-full h-11 text-xs uppercase tracking-widest transition-all rounded font-medium ${
                    subscription?.tier === plan.id
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      : plan.popular
                      ? "bg-zinc-100 hover:bg-white text-zinc-950"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                  }`}
                >
                  {loading === plan.id
                    ? "Loading..."
                    : subscription?.tier === plan.id
                    ? "Current Plan"
                    : "Upgrade"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Credits */}
      <section className="bg-zinc-900/30 border border-zinc-800 p-10 rounded-lg">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2">
              Buy Extra Credits
            </h2>
            <p className="text-sm text-zinc-500 font-light">
              Credits never expire and are used after your monthly quota is depleted.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Balance</p>
            <p className="text-2xl font-extralight text-zinc-100">
              {(credits?.totalRemaining ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() =>
                handleBuyCredits(pack.id as "starter" | "standard" | "bulk")
              }
              disabled={loading === pack.id}
              className="group bg-zinc-950 border border-zinc-800 hover:border-zinc-100 p-6 flex flex-col items-center transition-all rounded-lg"
            >
              <p className="text-sm font-medium text-zinc-100 mb-1">{pack.name}</p>
              <p className="text-xs text-zinc-500 mb-4">
                {pack.tokens.toLocaleString()} tokens
              </p>
              <div className="flex items-center gap-2 text-lg font-light text-zinc-100 group-hover:scale-105 transition-transform">
                ${pack.price}
                <ArrowUpRight size={14} className="text-zinc-500" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
