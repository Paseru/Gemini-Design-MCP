import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

// Internal: Create a new subscription
export const create = internalMutation({
  args: {
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    monthlyTokenQuota: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      tier: args.tier,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000, // 30 days
      monthlyTokenQuota: args.monthlyTokenQuota,
      tokensUsedThisPeriod: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Internal: Update subscription
export const update = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    status: v.string(),
    monthlyTokenQuota: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.subscriptionId, {
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      tier: args.tier,
      status: args.status,
      monthlyTokenQuota: args.monthlyTokenQuota,
      updatedAt: Date.now(),
    });
  },
});

// Internal: Update subscription status
export const updateStatus = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    status: v.string(),
  },
  handler: async (ctx, { subscriptionId, status }) => {
    await ctx.db.patch(subscriptionId, {
      status,
      updatedAt: Date.now(),
    });
  },
});
