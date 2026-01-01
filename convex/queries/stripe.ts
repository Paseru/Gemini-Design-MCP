import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

// Internal: Get Stripe event by ID (for idempotency check)
export const getEvent = internalQuery({
  args: { stripeEventId: v.string() },
  handler: async (ctx, { stripeEventId }) => {
    return await ctx.db
      .query("stripeEvents")
      .withIndex("by_stripeEventId", (q) => q.eq("stripeEventId", stripeEventId))
      .first();
  },
});
