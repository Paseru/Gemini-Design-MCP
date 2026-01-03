/**
 * Stripe configuration with automatic dev/prod detection
 *
 * The environment is automatically detected based on the STRIPE_SECRET_KEY:
 * - sk_test_* → Test mode (development)
 * - sk_live_* → Live mode (production)
 *
 * Each Convex deployment should have its own set of environment variables:
 * - Dev deployment: Test keys and test price IDs
 * - Prod deployment: Live keys and live price IDs
 */

import Stripe from "stripe";

export type StripeMode = "test" | "live";

let stripeInstance: Stripe | null = null;

/**
 * Get or create the Stripe instance
 */
export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }

  stripeInstance = new Stripe(key);
  return stripeInstance;
}

/**
 * Detect if we're in test or live mode based on the secret key
 */
export function getStripeMode(): StripeMode {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }

  if (key.startsWith("sk_test_")) {
    return "test";
  } else if (key.startsWith("sk_live_")) {
    return "live";
  }

  // Default to test for safety
  console.warn("Unknown Stripe key format, defaulting to test mode");
  return "test";
}

/**
 * Check if we're in test mode
 */
export function isTestMode(): boolean {
  return getStripeMode() === "test";
}

/**
 * Get the price ID for a subscription tier
 */
export function getSubscriptionPriceId(tier: "pro" | "enterprise"): string {
  const priceId = tier === "pro"
    ? process.env.STRIPE_PRO_PRICE_ID
    : process.env.STRIPE_ENTERPRISE_PRICE_ID;

  if (!priceId) {
    const mode = getStripeMode();
    throw new Error(
      `STRIPE_${tier.toUpperCase()}_PRICE_ID not configured for ${mode} mode. ` +
      `Please set this environment variable in your Convex deployment.`
    );
  }

  return priceId;
}

/**
 * Get the price ID for a credit package
 */
export function getCreditsPriceId(pkg: "starter" | "standard" | "bulk"): string {
  const envKey = `STRIPE_CREDITS_${pkg.toUpperCase()}_PRICE_ID`;
  const priceId = process.env[envKey];

  if (!priceId) {
    const mode = getStripeMode();
    throw new Error(
      `${envKey} not configured for ${mode} mode. ` +
      `Please set this environment variable in your Convex deployment.`
    );
  }

  return priceId;
}

/**
 * Get the webhook secret
 */
export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  }

  return secret;
}

/**
 * Get the app URL for redirects
 */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_APP_URL or SITE_URL not configured");
  }

  return url;
}
