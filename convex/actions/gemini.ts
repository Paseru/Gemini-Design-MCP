"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import crypto from "crypto";

// Main proxy function: validates API key, checks quota, forwards to Gemini
export const validateAndProxy = internalAction({
  args: {
    apiKey: v.string(),
    body: v.any(),
  },
  handler: async (ctx, { apiKey, body }): Promise<{
    success: boolean;
    error?: string;
    statusCode?: number;
    result?: any;
  }> => {
    const requestId = crypto.randomUUID();

    // 1. Hash and validate API key
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");
    const apiKeyDoc = await ctx.runQuery(internal.queries.apiKeys.getByHash, {
      hash: hashedKey,
    });

    if (!apiKeyDoc) {
      return { success: false, error: "Invalid API key", statusCode: 401 };
    }

    if (!apiKeyDoc.isActive) {
      return { success: false, error: "API key has been revoked", statusCode: 401 };
    }

    // Update last used timestamp
    await ctx.runMutation(internal.mutations.apiKeys.updateLastUsed, {
      keyId: apiKeyDoc._id,
    });

    // 2. Estimate tokens (conservative estimate for pre-check)
    // Average generation is ~1500 output tokens
    const estimatedOutputTokens = 2000;

    // 3. Check quota/credits
    const billing = await ctx.runMutation(internal.mutations.billing.checkAndDeduct, {
      userId: apiKeyDoc.userId,
      outputTokens: estimatedOutputTokens,
    });

    if (!billing.allowed) {
      return {
        success: false,
        error: "Insufficient quota or credits. Please upgrade your plan or purchase additional credits.",
        statusCode: 402,
      };
    }

    // 4. Call Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Refund the deducted tokens since we can't process the request
      await ctx.runMutation(internal.mutations.billing.adjustTokens, {
        userId: apiKeyDoc.userId,
        estimated: estimatedOutputTokens,
        actual: 0,
        billedFrom: billing.billedFrom,
      });
      return {
        success: false,
        error: "Server configuration error",
        statusCode: 500,
      };
    }

    try {
      // Extract model from body, default to gemini-3-flash-preview
      const model = body.model || "gemini-3-flash-preview";

      // Remove model from body before sending to Gemini (it goes in the URL)
      const { model: _, ...geminiBody } = body;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiBody),
        }
      );

      const result = await geminiResponse.json();

      // 5. Get actual token counts
      const actualInputTokens = result.usageMetadata?.promptTokenCount || 0;
      const actualOutputTokens = result.usageMetadata?.candidatesTokenCount || 0;

      // 6. Adjust token deduction if estimate was wrong
      if (actualOutputTokens !== estimatedOutputTokens) {
        await ctx.runMutation(internal.mutations.billing.adjustTokens, {
          userId: apiKeyDoc.userId,
          estimated: estimatedOutputTokens,
          actual: actualOutputTokens,
          billedFrom: billing.billedFrom,
        });
      }

      // 7. Log usage
      const endpoint = body.endpoint || "generate";
      await ctx.runMutation(internal.mutations.billing.logUsage, {
        userId: apiKeyDoc.userId,
        apiKeyId: apiKeyDoc._id,
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        model,
        endpoint,
        billedFrom: billing.billedFrom,
        success: geminiResponse.ok,
        errorMessage: geminiResponse.ok ? undefined : result.error?.message,
        requestId,
      });

      if (!geminiResponse.ok) {
        return {
          success: false,
          error: result.error?.message || "Gemini API error",
          statusCode: geminiResponse.status,
        };
      }

      return { success: true, result };
    } catch (error) {
      // Refund on network error
      await ctx.runMutation(internal.mutations.billing.adjustTokens, {
        userId: apiKeyDoc.userId,
        estimated: estimatedOutputTokens,
        actual: 0,
        billedFrom: billing.billedFrom,
      });

      // Log failed request
      const failedModel = body.model || "gemini-3-flash-preview";
      await ctx.runMutation(internal.mutations.billing.logUsage, {
        userId: apiKeyDoc.userId,
        apiKeyId: apiKeyDoc._id,
        inputTokens: 0,
        outputTokens: 0,
        model: failedModel,
        endpoint: body.endpoint || "generate",
        billedFrom: billing.billedFrom,
        success: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        requestId,
      });

      return {
        success: false,
        error: "Failed to connect to Gemini API",
        statusCode: 503,
      };
    }
  },
});
