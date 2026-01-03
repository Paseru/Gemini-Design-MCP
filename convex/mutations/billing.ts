import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { calculateCost } from "../lib/constants";

// Internal: Check and deduct tokens from quota or credits
export const checkAndDeduct = internalMutation({
  args: {
    userId: v.id("users"),
    totalTokens: v.number(), // input + output tokens
  },
  handler: async (ctx, { userId, totalTokens }) => {
    // 1. Check subscription quota first
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (subscription && subscription.status === "active") {
      const remainingQuota = subscription.monthlyTokenQuota - subscription.tokensUsedThisPeriod;

      if (remainingQuota >= totalTokens) {
        // Deduct from quota
        await ctx.db.patch(subscription._id, {
          tokensUsedThisPeriod: subscription.tokensUsedThisPeriod + totalTokens,
          updatedAt: Date.now(),
        });
        return { allowed: true, billedFrom: "quota" as const };
      }
    }

    // 2. Check credits if quota insufficient
    const credits = await ctx.db
      .query("credits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.gt(q.field("remaining"), 0))
      .collect();

    // Sort by expiration (soonest first) or by purchase date
    credits.sort((a, b) => {
      if (a.expiresAt && b.expiresAt) return a.expiresAt - b.expiresAt;
      return a.purchasedAt - b.purchasedAt;
    });

    let tokensNeeded = totalTokens;

    for (const credit of credits) {
      if (tokensNeeded <= 0) break;

      const deduct = Math.min(credit.remaining, tokensNeeded);
      await ctx.db.patch(credit._id, {
        remaining: credit.remaining - deduct,
      });
      tokensNeeded -= deduct;
    }

    if (tokensNeeded <= 0) {
      return { allowed: true, billedFrom: "credits" as const };
    }

    // Not enough tokens available
    return { allowed: false, billedFrom: "credits" as const };
  },
});

// Internal: Adjust tokens if estimate was wrong
export const adjustTokens = internalMutation({
  args: {
    userId: v.id("users"),
    estimated: v.number(),
    actual: v.number(),
    billedFrom: v.union(v.literal("quota"), v.literal("credits")),
  },
  handler: async (ctx, { userId, estimated, actual, billedFrom }) => {
    const difference = actual - estimated;

    if (difference === 0) return;

    if (billedFrom === "quota") {
      const subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

      if (subscription) {
        const newUsed = Math.max(0, subscription.tokensUsedThisPeriod + difference);
        await ctx.db.patch(subscription._id, {
          tokensUsedThisPeriod: newUsed,
          updatedAt: Date.now(),
        });
      }
    } else {
      // Adjust credits: negative difference = refund tokens back
      const credits = await ctx.db
        .query("credits")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .filter((q) => q.gt(q.field("remaining"), 0))
        .collect();

      // Sort by expiration (soonest first)
      credits.sort((a, b) => {
        if (a.expiresAt && b.expiresAt) return a.expiresAt - b.expiresAt;
        return a.purchasedAt - b.purchasedAt;
      });

      if (difference < 0) {
        // Refund: add tokens back to the first credit with remaining balance
        // Or find the most recent credit purchase to add back to
        const allCredits = await ctx.db
          .query("credits")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect();

        // Add refund to the most recent credit
        const mostRecent = allCredits.sort((a, b) => b.purchasedAt - a.purchasedAt)[0];
        if (mostRecent) {
          await ctx.db.patch(mostRecent._id, {
            remaining: mostRecent.remaining + Math.abs(difference),
          });
        }
      } else {
        // Additional charge: deduct more tokens
        let tokensNeeded = difference;
        for (const credit of credits) {
          if (tokensNeeded <= 0) break;
          const deduct = Math.min(credit.remaining, tokensNeeded);
          await ctx.db.patch(credit._id, {
            remaining: credit.remaining - deduct,
          });
          tokensNeeded -= deduct;
        }
      }
    }
  },
});

// Internal: Log usage
export const logUsage = internalMutation({
  args: {
    userId: v.id("users"),
    apiKeyId: v.id("apiKeys"),
    inputTokens: v.number(),
    outputTokens: v.number(),
    model: v.string(),
    endpoint: v.string(),
    billedFrom: v.union(v.literal("quota"), v.literal("credits")),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    requestId: v.string(),
    latencyMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const costUsd = calculateCost(args.inputTokens, args.outputTokens);

    await ctx.db.insert("usageLogs", {
      userId: args.userId,
      apiKeyId: args.apiKeyId,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      model: args.model,
      endpoint: args.endpoint,
      costUsd,
      billedFrom: args.billedFrom,
      createdAt: Date.now(),
      requestId: args.requestId,
      success: args.success,
      errorMessage: args.errorMessage,
      latencyMs: args.latencyMs,
    });
  },
});

// Internal: Reset monthly quota (called by cron or subscription renewal)
export const resetMonthlyQuota = internalMutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, { subscriptionId }) => {
    const subscription = await ctx.db.get(subscriptionId);
    if (!subscription) return;

    const now = Date.now();
    await ctx.db.patch(subscriptionId, {
      tokensUsedThisPeriod: 0,
      currentPeriodStart: now,
      currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000,
      updatedAt: now,
    });
  },
});
