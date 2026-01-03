import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

// Internal: Add credits after purchase
export const add = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, { userId, amount, stripePaymentIntentId }) => {
    const now = Date.now();

    // Credits expire in 1 year
    const expiresAt = now + 365 * 24 * 60 * 60 * 1000;

    return await ctx.db.insert("credits", {
      userId,
      amount,
      remaining: amount,
      stripePaymentIntentId,
      purchasedAt: now,
      expiresAt,
    });
  },
});

// Internal: Deduct credits
export const deduct = internalMutation({
  args: {
    creditId: v.id("credits"),
    amount: v.number(),
  },
  handler: async (ctx, { creditId, amount }) => {
    const credit = await ctx.db.get(creditId);
    if (!credit) throw new Error("Credit not found");

    const newRemaining = Math.max(0, credit.remaining - amount);
    await ctx.db.patch(creditId, { remaining: newRemaining });

    return newRemaining;
  },
});

