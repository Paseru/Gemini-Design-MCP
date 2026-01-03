"use node";

import { action, internalAction, ActionCtx } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { auth } from "../auth";
import Stripe from "stripe";
import { PRICING_TIERS, CREDIT_PACKAGES } from "../lib/constants";
import { Id } from "../_generated/dataModel";
import {
  getStripe,
  getSubscriptionPriceId,
  getCreditsPriceId,
  getWebhookSecret,
  getAppUrl,
  getStripeMode,
} from "../lib/stripe";

// Create checkout session for subscription
export const createCheckoutSession = action({
  args: { tier: v.union(v.literal("pro"), v.literal("enterprise")) },
  handler: async (ctx, { tier }): Promise<string | null> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const stripe = getStripe();
    const tierConfig = PRICING_TIERS[tier];

    // Get or create Stripe customer
    const profile = await ctx.runQuery(internal.queries.users.getProfileByUserId, { userId });
    let customerId: string | undefined = profile?.stripeCustomerId;

    if (!customerId) {
      const user = await ctx.runQuery(internal.queries.users.getById, { userId });
      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        metadata: { convexUserId: userId },
      });
      customerId = customer.id;

      await ctx.runMutation(internal.mutations.users.updateStripeCustomerId, {
        userId,
        stripeCustomerId: customerId,
      });
    }

    const priceId = getSubscriptionPriceId(tier);
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/settings/billing?checkout=canceled`,
      metadata: { convexUserId: userId, tier },
    });

    return session.url;
  },
});

// Create checkout for credit purchase
export const purchaseCredits = action({
  args: {
    package: v.union(v.literal("starter"), v.literal("standard"), v.literal("bulk"))
  },
  handler: async (ctx, { package: pkg }): Promise<string | null> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const stripe = getStripe();
    const packageConfig = CREDIT_PACKAGES[pkg];

    // Get or create Stripe customer
    const profile = await ctx.runQuery(internal.queries.users.getProfileByUserId, { userId });
    let customerId: string | undefined = profile?.stripeCustomerId;

    if (!customerId) {
      const user = await ctx.runQuery(internal.queries.users.getById, { userId });
      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        metadata: { convexUserId: userId },
      });
      customerId = customer.id;

      await ctx.runMutation(internal.mutations.users.updateStripeCustomerId, {
        userId,
        stripeCustomerId: customerId,
      });
    }

    const priceId = getCreditsPriceId(pkg);
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${appUrl}/dashboard?credits=success`,
      cancel_url: `${appUrl}/dashboard?credits=canceled`,
      metadata: {
        convexUserId: userId,
        type: "credits",
        package: pkg,
        tokens: packageConfig.tokens.toString(),
      },
    });

    return session.url;
  },
});

// Create customer portal session
export const createPortalSession = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const stripe = getStripe();
    const profile = await ctx.runQuery(internal.queries.users.getProfileByUserId, { userId });

    if (!profile?.stripeCustomerId) {
      throw new Error("No billing account found");
    }

    const appUrl = getAppUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: `${appUrl}/settings/billing`,
    });

    return session.url;
  },
});

// Handle Stripe webhooks (called by Convex HTTP route /stripe/webhook)
export const handleWebhook = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, { signature, payload }): Promise<{ success: boolean }> => {
    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return { success: false };
    }

    // Check idempotency
    const existing = await ctx.runQuery(internal.queries.stripe.getEvent, {
      stripeEventId: event.id,
    });
    if (existing) {
      return { success: true }; // Already processed
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutComplete(ctx, session);
          break;
        }
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionChange(ctx, subscription, event.type);
          break;
        }
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaid(ctx, invoice);
          break;
        }
      }

      // Mark event as processed
      await ctx.runMutation(internal.mutations.stripe.markEventProcessed, {
        stripeEventId: event.id,
        type: event.type,
      });

      return { success: true };
    } catch (err) {
      console.error("Error processing webhook:", err);
      return { success: false };
    }
  },
});

async function handleCheckoutComplete(ctx: ActionCtx, session: Stripe.Checkout.Session) {
  const userId = session.metadata?.convexUserId as Id<"users"> | undefined;
  if (!userId) return;

  if (session.mode === "subscription") {
    // Subscription checkout completed
    const tier = session.metadata?.tier as "pro" | "enterprise";
    const stripeSubscriptionId = session.subscription as string;
    const tierConfig = PRICING_TIERS[tier];

    // Create or update subscription
    const existing = await ctx.runQuery(internal.queries.subscriptions.getByUserId, { userId });

    if (existing) {
      await ctx.runMutation(internal.mutations.subscriptions.update, {
        subscriptionId: existing._id,
        stripeSubscriptionId,
        stripePriceId: session.metadata?.priceId || "",
        tier,
        status: "active",
        monthlyTokenQuota: tierConfig.monthlyTokenQuota,
        resetUsage: true, // Reset quota on upgrade/change
      });
    } else {
      await ctx.runMutation(internal.mutations.subscriptions.create, {
        userId,
        stripeSubscriptionId,
        stripePriceId: session.metadata?.priceId || "",
        tier,
        monthlyTokenQuota: tierConfig.monthlyTokenQuota,
      });
    }

    // Update user profile tier
    await ctx.runMutation(internal.mutations.users.updateSubscriptionTier, { userId, tier });
  } else if (session.mode === "payment" && session.metadata?.type === "credits") {
    // Credit purchase completed
    const tokens = parseInt(session.metadata?.tokens || "0");
    const paymentIntentId = session.payment_intent as string;

    await ctx.runMutation(internal.mutations.credits.add, {
      userId,
      amount: tokens,
      stripePaymentIntentId: paymentIntentId,
    });
  }
}

async function handleSubscriptionChange(
  ctx: ActionCtx,
  subscription: Stripe.Subscription,
  eventType: string
) {
  const sub = await ctx.runQuery(internal.queries.subscriptions.getByStripeId, {
    stripeSubscriptionId: subscription.id,
  });

  if (!sub) return;

  const status = subscription.status;
  const canceled = eventType === "customer.subscription.deleted";

  await ctx.runMutation(internal.mutations.subscriptions.updateStatus, {
    subscriptionId: sub._id,
    status: canceled ? "canceled" : status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  if (canceled) {
    // Downgrade to free tier
    await ctx.runMutation(internal.mutations.users.updateSubscriptionTier, {
      userId: sub.userId,
      tier: "free",
    });
  }
}

async function handleInvoicePaid(ctx: ActionCtx, invoice: Stripe.Invoice) {
  // Reset monthly quota on successful subscription payment
  const subscriptionId = (invoice as any).subscription as string | null;
  if (!subscriptionId) return;

  const sub = await ctx.runQuery(internal.queries.subscriptions.getByStripeId, {
    stripeSubscriptionId: subscriptionId,
  });

  if (sub) {
    await ctx.runMutation(internal.mutations.billing.resetMonthlyQuota, {
      subscriptionId: sub._id,
    });
  }
}

// Setup Stripe products and prices (run once to initialize)
export const setupStripeProducts = action({
  args: {},
  handler: async (): Promise<{
    products: Record<string, string>;
    prices: Record<string, string>;
  }> => {
    const stripe = getStripe();
    const products: Record<string, string> = {};
    const prices: Record<string, string> = {};

    // Create Pro Subscription product
    const proProduct = await stripe.products.create({
      name: "Pro Subscription",
      description: "1M tokens/month (~660 generations). Perfect for individual developers.",
    });
    products.pro = proProduct.id;

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1900, // $19
      currency: "usd",
      recurring: { interval: "month" },
    });
    prices.STRIPE_PRO_PRICE_ID = proPrice.id;

    // Create Enterprise Subscription product
    const enterpriseProduct = await stripe.products.create({
      name: "Enterprise Subscription",
      description: "6M tokens/month (~4000 generations). For teams and high-volume usage.",
    });
    products.enterprise = enterpriseProduct.id;

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 7900, // $79
      currency: "usd",
      recurring: { interval: "month" },
    });
    prices.STRIPE_ENTERPRISE_PRICE_ID = enterprisePrice.id;

    // Create Starter Credits product
    const starterProduct = await stripe.products.create({
      name: "Starter Credits",
      description: "50,000 tokens one-time purchase.",
    });
    products.starter = starterProduct.id;

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 500, // $5
      currency: "usd",
    });
    prices.STRIPE_CREDITS_STARTER_PRICE_ID = starterPrice.id;

    // Create Standard Credits product
    const standardProduct = await stripe.products.create({
      name: "Standard Credits",
      description: "250,000 tokens one-time purchase.",
    });
    products.standard = standardProduct.id;

    const standardPrice = await stripe.prices.create({
      product: standardProduct.id,
      unit_amount: 2000, // $20
      currency: "usd",
    });
    prices.STRIPE_CREDITS_STANDARD_PRICE_ID = standardPrice.id;

    // Create Bulk Credits product
    const bulkProduct = await stripe.products.create({
      name: "Bulk Credits",
      description: "750,000 tokens one-time purchase.",
    });
    products.bulk = bulkProduct.id;

    const bulkPrice = await stripe.prices.create({
      product: bulkProduct.id,
      unit_amount: 5000, // $50
      currency: "usd",
    });
    prices.STRIPE_CREDITS_BULK_PRICE_ID = bulkPrice.id;

    console.log("=== STRIPE SETUP COMPLETE ===");
    console.log("Add these to your Convex environment variables:");
    console.log(JSON.stringify(prices, null, 2));

    return { products, prices };
  },
})
