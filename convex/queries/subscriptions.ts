import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { auth } from "../auth";

// Get current user's subscription
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!subscription) return null;

    return {
      _id: subscription._id,
      tier: subscription.tier,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
      quota: subscription.monthlyTokenQuota,
      used: subscription.tokensUsedThisPeriod,
      remaining: Math.max(0, subscription.monthlyTokenQuota - subscription.tokensUsedThisPeriod),
      percentUsed: Math.round(
        (subscription.tokensUsedThisPeriod / subscription.monthlyTokenQuota) * 100
      ),
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
    };
  },
});

// Internal: Get subscription by Stripe ID
export const getByStripeId = internalQuery({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, { stripeSubscriptionId }) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", stripeSubscriptionId)
      )
      .first();
  },
});

// Internal: Get subscription by user ID
export const getByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});
