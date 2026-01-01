import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

// Internal: Mark Stripe event as processed
export const markEventProcessed = internalMutation({
  args: {
    stripeEventId: v.string(),
    type: v.string(),
  },
  handler: async (ctx, { stripeEventId, type }) => {
    await ctx.db.insert("stripeEvents", {
      stripeEventId,
      type,
      processedAt: Date.now(),
    });
  },
});
