import { query } from "../_generated/server";
import { v } from "convex/values";
import { auth } from "../auth";

// Get usage statistics for current user
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    // Get subscription for quota info
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    // Get recent usage logs (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const logs = await ctx.db
      .query("usageLogs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("createdAt"), thirtyDaysAgo))
      .collect();

    // Calculate totals
    const totalInputTokens = logs.reduce((sum, log) => sum + log.inputTokens, 0);
    const totalOutputTokens = logs.reduce((sum, log) => sum + log.outputTokens, 0);
    const totalCost = logs.reduce((sum, log) => sum + log.costUsd, 0);
    const totalRequests = logs.length;
    const successfulRequests = logs.filter((l) => l.success).length;

    // Calculate average latency (only from logs that have latencyMs)
    const logsWithLatency = logs.filter((l) => l.latencyMs !== undefined && l.latencyMs > 0);
    const avgLatencyMs = logsWithLatency.length > 0
      ? Math.round(logsWithLatency.reduce((sum, log) => sum + (log.latencyMs || 0), 0) / logsWithLatency.length)
      : null;

    // Get credits remaining
    const credits = await ctx.db
      .query("credits")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.gt(q.field("remaining"), 0))
      .collect();
    const creditsRemaining = credits.reduce((sum, c) => sum + c.remaining, 0);

    return {
      subscription: subscription
        ? {
            tier: subscription.tier,
            status: subscription.status,
            quota: subscription.monthlyTokenQuota,
            used: subscription.tokensUsedThisPeriod,
            remaining: subscription.monthlyTokenQuota - subscription.tokensUsedThisPeriod,
            periodEnd: subscription.currentPeriodEnd,
          }
        : null,
      creditsRemaining,
      last30Days: {
        totalInputTokens,
        totalOutputTokens,
        totalCost,
        totalRequests,
        successfulRequests,
        avgLatencyMs,
      },
    };
  },
});

// Get usage history (paginated) - used by main dashboard for limited preview
export const getHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return { logs: [], hasMore: false };

    const logs = await ctx.db
      .query("usageLogs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit + 1);

    const hasMore = logs.length > limit;
    const results = logs.slice(0, limit);

    return {
      logs: results.map((log) => ({
        _id: log._id,
        endpoint: log.endpoint,
        inputTokens: log.inputTokens,
        outputTokens: log.outputTokens,
        costUsd: log.costUsd,
        billedFrom: log.billedFrom,
        success: log.success,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt,
        latencyMs: log.latencyMs,
      })),
      hasMore,
    };
  },
});

// Get usage history with page-based pagination - used by /dashboard/usage
export const getHistoryPaginated = query({
  args: {
    page: v.number(), // 0-indexed
    pageSize: v.number(),
  },
  handler: async (ctx, { page, pageSize }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return {
        logs: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    // Get total count for pagination info
    const allLogs = await ctx.db
      .query("usageLogs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const totalCount = allLogs.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get paginated results
    const offset = page * pageSize;
    const logs = await ctx.db
      .query("usageLogs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(offset + pageSize);

    const paginatedLogs = logs.slice(offset, offset + pageSize);

    return {
      logs: paginatedLogs.map((log) => ({
        _id: log._id,
        endpoint: log.endpoint,
        inputTokens: log.inputTokens,
        outputTokens: log.outputTokens,
        costUsd: log.costUsd,
        billedFrom: log.billedFrom,
        success: log.success,
        errorMessage: log.errorMessage,
        createdAt: log.createdAt,
      })),
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  },
});

// Get daily usage for charts
export const getDailyUsage = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 30 }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;
    const logs = await ctx.db
      .query("usageLogs")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    // Group by day
    const dailyMap = new Map<string, { tokens: number; requests: number; cost: number }>();

    for (const log of logs) {
      const date = new Date(log.createdAt).toISOString().split("T")[0];
      const existing = dailyMap.get(date) || { tokens: 0, requests: 0, cost: 0 };
      dailyMap.set(date, {
        tokens: existing.tokens + log.outputTokens,
        requests: existing.requests + 1,
        cost: existing.cost + log.costUsd,
      });
    }

    // Convert to array sorted by date
    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});
