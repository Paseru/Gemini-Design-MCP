import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Extended user profile
  userProfiles: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.optional(v.string()),
    subscriptionTier: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  // API Keys (format: gd_xxxxxxxx)
  apiKeys: defineTable({
    userId: v.id("users"),
    key: v.string(), // hashed for validation
    keyRaw: v.string(), // plain text for display/copy
    keyPrefix: v.string(), // "gd_" + first 8 chars for display
    name: v.string(),
    lastUsedAt: v.optional(v.number()),
    createdAt: v.number(),
    isActive: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_key", ["key"]),

  // Subscriptions
  subscriptions: defineTable({
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    tier: v.union(
      v.literal("free"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
    status: v.string(), // "active", "canceled", "past_due", etc.
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    monthlyTokenQuota: v.number(), // output tokens allowed per month
    tokensUsedThisPeriod: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),

  // Credits (pay-as-you-go extras)
  credits: defineTable({
    userId: v.id("users"),
    amount: v.number(), // tokens purchased
    remaining: v.number(), // tokens remaining
    stripePaymentIntentId: v.string(),
    purchasedAt: v.number(),
    expiresAt: v.optional(v.number()), // credits may expire
  }).index("by_userId", ["userId"]),

  // Usage Logs (every API call)
  usageLogs: defineTable({
    userId: v.id("users"),
    apiKeyId: v.id("apiKeys"),
    inputTokens: v.number(),
    outputTokens: v.number(),
    model: v.string(),
    endpoint: v.string(), // "create_frontend", "modify_frontend", "snippet_frontend"
    costUsd: v.number(), // our cost for this request
    billedFrom: v.union(v.literal("quota"), v.literal("credits")),
    createdAt: v.number(),
    requestId: v.string(), // for debugging
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_apiKeyId", ["apiKeyId"])
    .index("by_createdAt", ["createdAt"]),

  // Stripe webhook events (for idempotency)
  stripeEvents: defineTable({
    stripeEventId: v.string(),
    type: v.string(),
    processedAt: v.number(),
  }).index("by_stripeEventId", ["stripeEventId"]),
});
