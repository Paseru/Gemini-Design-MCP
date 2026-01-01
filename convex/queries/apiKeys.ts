import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { auth } from "../auth";

// Get the user's API key (only one per user)
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const key = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!key) return null;

    return {
      _id: key._id,
      keyRaw: key.keyRaw,
      keyPrefix: key.keyPrefix,
      name: key.name,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      isActive: key.isActive,
    };
  },
});

// Internal: Get API key by hash (for validation)
export const getByHash = internalQuery({
  args: { hash: v.string() },
  handler: async (ctx, { hash }) => {
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("key", hash))
      .first();

    return apiKey;
  },
});

