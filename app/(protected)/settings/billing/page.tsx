"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  AlertCircle,
} from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    desc: "Perfect for experimenting with the MCP protocol.",
    features: ["10K tokens / month", "~7 UI generations", "All MCP tools included", "Discord community"],
  },
  {
    id: "pro",
    name: "Professional",
    price: 19,
    desc: "For developers shipping UI daily.",
    features: ["1M tokens / month", "~660 UI generations", "All MCP tools included", "Discord community"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 79,
    desc: "For teams and high-volume usage.",
    features: ["6M tokens / month", "~4,000 UI generations", "All MCP tools included", "Discord community"],
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
      // If user already has an active subscription, redirect to portal
      // Stripe portal handles plan changes, pro-rata, etc.
      if (subscription && subscription.tier !== "free") {
        const url = await createPortal();
        if (url) window.location.href = url;
      } else {
        // New subscription - create checkout session
        const url = await createCheckout({ tier });
        if (url) window.location.href = url;
      }
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-end justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-extralight tracking-tighter text-zinc-100 mb-1">
            Billing & Plans
          </h1>
          <p className="text-[10px] text-zinc-500 font-light uppercase tracking-widest">
            Manage your subscription and purchase credits
          </p>
        </div>
        {subscription && subscription.tier !== "free" && (
          <button
            onClick={handleManageBilling}
            disabled={loading === "portal"}
            className="h-9 px-4 flex items-center gap-2 text-[10px] bg-zinc-100 hover:bg-white text-zinc-950 transition-colors uppercase tracking-widest rounded font-medium"
          >
            <CreditCard size={12} />
            {loading === "portal" ? "Loading..." : "Manage Billing"}
          </button>
        )}
      </header>

      {/* Cancellation Notice */}
      {subscription?.cancelAtPeriodEnd && (
        <div className="bg-amber-950/30 border border-amber-800/50 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-amber-200 font-medium mb-1">
              Your subscription has been canceled
            </p>
            <p className="text-xs text-amber-400/80 font-light">
              You will not be charged next month. Your plan remains active until{" "}
              <span className="font-medium text-amber-300">
                {subscription.periodEnd
                  ? new Date(subscription.periodEnd).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "the end of your billing period"}
              </span>
              . After that, you'll be downgraded to the free plan.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <section className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 border border-zinc-700 rounded">
              <Zap size={16} className="text-zinc-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">
                  Current Plan
                </span>
                <span className="px-1.5 py-0.5 text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-widest font-medium rounded">
                  {subscription?.tier || "free"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-light">
                {subscription?.remaining?.toLocaleString() || 0} tokens remaining this period
              </p>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">Period Ends</p>
            <p className="text-sm font-light text-zinc-100">
              {subscription?.periodEnd
                ? new Date(subscription.periodEnd).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[9px] text-zinc-500 uppercase tracking-widest mb-2">
            <span>{subscription?.used?.toLocaleString() || 0} used</span>
            <span>{subscription?.quota?.toLocaleString() || 0} total</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 overflow-hidden rounded-full">
            <div
              className="h-full bg-zinc-100 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </section>

      {/* Plans */}
      <section>
        <h2 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-5">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-5 rounded-lg border flex flex-col h-full overflow-hidden group ${
                plan.popular
                  ? "border-zinc-100 bg-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 p-3">
                  <span className="bg-zinc-100 text-zinc-950 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Popular</span>
                </div>
              )}

              <p className={`text-[9px] uppercase tracking-widest font-bold mb-2 ${plan.popular ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {plan.name}
              </p>

              <div className="flex items-baseline gap-0.5 mb-4">
                <span className={`text-2xl font-light tracking-tighter ${plan.popular ? 'text-zinc-100' : 'text-zinc-300'}`}>
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                </span>
                {plan.price !== 0 && <span className="text-zinc-600 text-[10px]">/mo</span>}
              </div>

              <p className="text-[11px] text-zinc-500 mb-5 leading-relaxed">{plan.desc}</p>

              <ul className="space-y-2.5 mb-6 flex-grow">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[10px] text-zinc-400"
                  >
                    <CheckCircle2 className={`w-3 h-3 ${plan.popular ? 'text-zinc-100' : 'text-zinc-600'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded text-xs font-medium bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed"
                >
                  {subscription?.tier === "free" ? "Current Plan" : "Downgrade via Portal"}
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id as "pro" | "enterprise")}
                  disabled={loading === plan.id || subscription?.tier === plan.id}
                  className={`w-full py-2.5 rounded text-xs font-medium transition-all ${
                    subscription?.tier === plan.id
                      ? "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed"
                      : plan.popular
                      ? "bg-zinc-100 text-zinc-950 hover:bg-white"
                      : "bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800"
                  }`}
                >
                  {loading === plan.id
                    ? "Loading..."
                    : subscription?.tier === plan.id
                    ? "Current Plan"
                    : plan.id === "enterprise" ? "Go Enterprise" : "Go Pro"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Credits */}
      <section className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-1">
              Buy Extra Credits
            </h2>
            <p className="text-xs text-zinc-500 font-light">
              Credits never expire and are used after your monthly quota.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">Balance</p>
            <p className="text-lg font-extralight text-zinc-100">
              {(credits?.totalRemaining ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CREDIT_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() =>
                handleBuyCredits(pack.id as "starter" | "standard" | "bulk")
              }
              disabled={loading === pack.id}
              className="group bg-zinc-950 border border-zinc-800 hover:border-zinc-100 p-4 flex flex-col items-center transition-all rounded-lg"
            >
              <p className="text-xs font-medium text-zinc-100 mb-0.5">{pack.name}</p>
              <p className="text-[10px] text-zinc-500 mb-3 uppercase tracking-tighter">
                {pack.tokens.toLocaleString()} tokens
              </p>
              <div className="flex items-center gap-1.5 text-sm font-light text-zinc-100 group-hover:scale-105 transition-transform">
                ${pack.price}
                <ArrowUpRight size={12} className="text-zinc-500" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
