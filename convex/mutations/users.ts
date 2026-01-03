import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { auth } from "../auth";
import { PRICING_TIERS } from "../lib/constants";

// Create user profile after first login
export const createProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing;

    // Create new profile with free tier
    const now = Date.now();
    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      subscriptionTier: "free",
      createdAt: now,
      updatedAt: now,
    });

    // Create free subscription automatically
    await ctx.db.insert("subscriptions", {
      userId,
      stripeSubscriptionId: "free_tier",
      stripePriceId: "free",
      tier: "free",
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000, // 30 days
      monthlyTokenQuota: PRICING_TIERS.free.monthlyTokenQuota,
      tokensUsedThisPeriod: 0,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(profileId);
  },
});

// Internal: Update Stripe customer ID
export const updateStripeCustomerId = internalMutation({
  args: { userId: v.id("users"), stripeCustomerId: v.string() },
  handler: async (ctx, { userId, stripeCustomerId }) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        stripeCustomerId,
        updatedAt: Date.now(),
      });
    }
  },
});

// Internal: Update subscription tier
export const updateSubscriptionTier = internalMutation({
  args: {
    userId: v.id("users"),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
  },
  handler: async (ctx, { userId, tier }) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        subscriptionTier: tier,
        updatedAt: Date.now(),
      });
    }
  },
});
