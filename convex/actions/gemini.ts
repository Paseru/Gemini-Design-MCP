"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

// Vertex AI Configuration
// Credentials are stored in environment variables for security
function getVertexAIClient() {
  const clientEmail = process.env.VERTEX_CLIENT_EMAIL;
  const privateKey = process.env.VERTEX_PRIVATE_KEY;
  const project = process.env.VERTEX_PROJECT || "gemini-3-pro-481223";

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Vertex AI credentials in environment variables");
  }

  return new GoogleGenAI({
    vertexai: true,
    project,
    location: "global",
    googleAuthOptions: {
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
    },
  });
}

// Main proxy function: validates API key, checks quota, forwards to Gemini via Vertex AI
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
    // We estimate both input and output tokens
    const estimatedTotalTokens = 3000; // ~1000 input + ~2000 output

    // 3. Check quota/credits
    const billing = await ctx.runMutation(internal.mutations.billing.checkAndDeduct, {
      userId: apiKeyDoc.userId,
      totalTokens: estimatedTotalTokens,
    });

    if (!billing.allowed) {
      return {
        success: false,
        error: "Insufficient quota or credits. Please upgrade your plan or purchase additional credits.",
        statusCode: 402,
      };
    }

    // 4. Call Gemini via Vertex AI
    let ai: GoogleGenAI;
    try {
      ai = getVertexAIClient();
    } catch (error) {
      await ctx.runMutation(internal.mutations.billing.adjustTokens, {
        userId: apiKeyDoc.userId,
        estimated: estimatedTotalTokens,
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
      const model = body.model || "gemini-3-flash-preview";

      // Build the request for Vertex AI SDK
      const userPrompt = body.contents?.[0]?.parts?.[0]?.text || "";
      const systemPrompt = body.systemInstruction?.parts?.[0]?.text || "";

      // Measure latency
      const startTime = Date.now();
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: body.generationConfig?.temperature ?? 1,
        },
      });
      const latencyMs = Date.now() - startTime;

      // Get token counts from response
      const actualInputTokens = response.usageMetadata?.promptTokenCount || 0;
      const actualOutputTokens = response.usageMetadata?.candidatesTokenCount || 0;
      const actualTotalTokens = actualInputTokens + actualOutputTokens;

      // Adjust token deduction if estimate was wrong
      if (actualTotalTokens !== estimatedTotalTokens) {
        await ctx.runMutation(internal.mutations.billing.adjustTokens, {
          userId: apiKeyDoc.userId,
          estimated: estimatedTotalTokens,
          actual: actualTotalTokens,
          billedFrom: billing.billedFrom,
        });
      }

      // Log usage
      const endpoint = body.endpoint || "generate";
      await ctx.runMutation(internal.mutations.billing.logUsage, {
        userId: apiKeyDoc.userId,
        apiKeyId: apiKeyDoc._id,
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        model,
        endpoint,
        billedFrom: billing.billedFrom,
        success: true,
        requestId,
        latencyMs,
      });

      // Return response in Gemini API format for compatibility
      const result = {
        candidates: [
          {
            content: {
              parts: [{ text: response.text || "" }],
              role: "model",
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: actualInputTokens,
          candidatesTokenCount: actualOutputTokens,
        },
      };

      return { success: true, result };
    } catch (error) {
      // Refund on error
      await ctx.runMutation(internal.mutations.billing.adjustTokens, {
        userId: apiKeyDoc.userId,
        estimated: estimatedTotalTokens,
        actual: 0,
        billedFrom: billing.billedFrom,
      });

      const errorMessage = error instanceof Error ? error.message : "Unknown error";

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
        errorMessage,
        requestId,
      });

      return {
        success: false,
        error: errorMessage,
        statusCode: 503,
      };
    }
  },
});
