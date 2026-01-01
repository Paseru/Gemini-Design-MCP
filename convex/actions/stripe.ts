"use node";

import { action, internalAction, ActionCtx } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { auth } from "../auth";
import Stripe from "stripe";
import { PRICING_TIERS, CREDIT_PACKAGES } from "../lib/constants";
import { Id } from "../_generated/dataModel";

const getStripe = (): Stripe => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(key);
};

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

    const priceId = tier === "pro"
      ? process.env.STRIPE_PRO_PRICE_ID
      : process.env.STRIPE_ENTERPRISE_PRICE_ID;

    if (!priceId) throw new Error(`Price ID not configured for ${tier}`);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
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

    const priceId = process.env[`STRIPE_CREDITS_${pkg.toUpperCase()}_PRICE_ID`];
    if (!priceId) throw new Error(`Price ID not configured for ${pkg} credits`);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credits=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credits=canceled`,
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

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    return session.url;
  },
});

// Handle Stripe webhooks
export const handleWebhook = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, { signature, payload }): Promise<{ success: boolean }> => {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return { success: false };
    }

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
