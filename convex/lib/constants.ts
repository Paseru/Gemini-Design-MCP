// Pricing tiers and their token quotas
export const PRICING_TIERS = {
  free: {
    name: "Free",
    monthlyTokenQuota: 30_000, // ~20 generations
    priceUsd: 0,
    stripePriceId: null,
  },
  pro: {
    name: "Pro",
    monthlyTokenQuota: 500_000, // ~330 generations
    priceUsd: 19,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  enterprise: {
    name: "Enterprise",
    monthlyTokenQuota: 3_000_000, // ~2000 generations
    priceUsd: 79,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
} as const;

// Credit packages
export const CREDIT_PACKAGES = {
  starter: {
    name: "Starter",
    tokens: 50_000,
    priceUsd: 5,
    stripePriceId: process.env.STRIPE_CREDITS_STARTER_PRICE_ID,
  },
  standard: {
    name: "Standard",
    tokens: 250_000,
    priceUsd: 20,
    stripePriceId: process.env.STRIPE_CREDITS_STANDARD_PRICE_ID,
  },
  bulk: {
    name: "Bulk",
    tokens: 750_000,
    priceUsd: 50,
    stripePriceId: process.env.STRIPE_CREDITS_BULK_PRICE_ID,
  },
} as const;

// Gemini API costs (for internal tracking)
export const GEMINI_COSTS = {
  inputTokensPerMillion: 0.5, // $0.50 per 1M input tokens
  outputTokensPerMillion: 3.0, // $3.00 per 1M output tokens
} as const;

// Calculate our cost for a request
export function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * GEMINI_COSTS.inputTokensPerMillion;
  const outputCost = (outputTokens / 1_000_000) * GEMINI_COSTS.outputTokensPerMillion;
  return inputCost + outputCost;
}

export type SubscriptionTier = keyof typeof PRICING_TIERS;
export type CreditPackage = keyof typeof CREDIT_PACKAGES;
