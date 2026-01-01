import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { auth } from "../auth";

// Helper function to generate API key
async function generateApiKey() {
  // Generate API key: gd_ + 32 random chars (base64url safe)
  const randomBytes = new Uint8Array(24);
  crypto.getRandomValues(randomBytes);
  const randomString = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const rawKey = `gd_${randomString}`;

  // Hash the key for storage
  const encoder = new TextEncoder();
  const data = encoder.encode(rawKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedKey = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const keyPrefix = rawKey.substring(0, 11); // "gd_" + 8 chars

  return { rawKey, hashedKey, keyPrefix };
}

// Create a new API key (only one per user)
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has a key
    const existingKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingKey) {
      throw new Error("You already have an API key. Delete it first to create a new one.");
    }

    const { rawKey, hashedKey, keyPrefix } = await generateApiKey();

    await ctx.db.insert("apiKeys", {
      userId,
      key: hashedKey,
      keyRaw: rawKey,
      keyPrefix,
      name,
      createdAt: Date.now(),
      isActive: true,
    });

    // Return the raw key ONLY on creation (user must save it)
    return { key: rawKey, keyPrefix };
  },
});

// Regenerate API key (delete old one and create new)
export const regenerate = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find and delete existing key
    const existingKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingKey) {
      await ctx.db.delete(existingKey._id);
    }

    // Generate new key
    const { rawKey, hashedKey, keyPrefix } = await generateApiKey();

    await ctx.db.insert("apiKeys", {
      userId,
      key: hashedKey,
      keyRaw: rawKey,
      keyPrefix,
      name,
      createdAt: Date.now(),
      isActive: true,
    });

    return { key: rawKey, keyPrefix };
  },
});

// Rename the API key
export const rename = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const key = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!key) {
      throw new Error("API key not found");
    }

    await ctx.db.patch(key._id, { name });
    return { success: true };
  },
});

// Delete the API key
export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const key = await ctx.db
      .query("apiKeys")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!key) {
      throw new Error("API key not found");
    }

    await ctx.db.delete(key._id);
    return { success: true };
  },
});

// Internal: Update last used timestamp
export const updateLastUsed = internalMutation({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, { keyId }) => {
    await ctx.db.patch(keyId, { lastUsedAt: Date.now() });
  },
});
