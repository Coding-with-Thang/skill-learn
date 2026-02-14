import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@skill-learn/database";
import {
  stripe,
  verifyWebhookSignature,
  getPlanFromPriceId,
  mapSubscriptionStatus,
  PRICING_PLANS,
} from "@/lib/stripe";

// Disable body parsing for webhook signature verification
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");
  
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error("Stripe webhook secret not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }
  
  if (!stripe) {
    console.error("Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.");
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }
  
  let event;
  
  try {
    event = verifyWebhookSignature(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }
  
  console.log(`Processing Stripe webhook: ${event.type}`);
  
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
        
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;
        
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
        
      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object);
        break;
        
      default:
        // Unhandled event type - log for monitoring but don't error
        break;
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * This is called when a customer completes the checkout
 */
async function handleCheckoutCompleted(session: { customer?: string; subscription?: string; metadata?: { tenantId?: string; userId?: string } }) {
  if (!stripe) throw new Error("Stripe not configured");
  const { customer, subscription, metadata } = session;
  const { tenantId, userId } = metadata || {};
  if (!subscription) throw new Error("No subscription in session");

  // Get subscription details from Stripe (cast: SDK may return Response<Subscription>)
  const raw = await stripe.subscriptions.retrieve(subscription);
  const subscriptionDetails = raw as unknown as {
    status: string;
    trial_end: number | null;
    current_period_end: number;
    cancel_at_period_end: boolean;
    items: { data: Array<{ price?: { id?: string; recurring?: { interval?: string } } }> };
  };
  const priceId = subscriptionDetails.items.data[0]?.price?.id;
  const planId = getPlanFromPriceId(priceId) || "pro";
  const interval = subscriptionDetails.items.data[0]?.price?.recurring?.interval;
  
  // Determine limits based on plan
  const plan = PRICING_PLANS[planId] || PRICING_PLANS.pro;
  
  const updateData = {
    stripeCustomerId: customer ?? null,
    stripeSubscriptionId: subscription,
    stripePriceId: priceId ?? null,
    subscriptionTier: planId,
    subscriptionStatus: mapSubscriptionStatus(subscriptionDetails.status),
    billingInterval: interval ?? null,
    trialEndsAt: subscriptionDetails.trial_end
      ? new Date(subscriptionDetails.trial_end * 1000)
      : null,
    subscriptionEndsAt: new Date(subscriptionDetails.current_period_end * 1000),
    cancelAtPeriodEnd: subscriptionDetails.cancel_at_period_end,
  };

  if (tenantId) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });
  } else if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { tenant: true },
    });
    if (user?.tenantId) {
      await prisma.tenant.update({
        where: { id: user.tenantId },
        data: updateData,
      });
    }
  }
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(subscription) {
  // Find tenant by Stripe customer ID
  const tenant = await prisma.tenant.findFirst({
    where: { stripeCustomerId: subscription.customer },
  });
  
  if (!tenant) {
    console.warn("No tenant found for customer:", subscription.customer);
    return;
  }
  
  const priceId = subscription.items.data[0]?.price?.id;
  const planId = getPlanFromPriceId(priceId) || "pro";
  const interval = subscription.items.data[0]?.price?.recurring?.interval;
  
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      subscriptionTier: planId,
      subscriptionStatus: mapSubscriptionStatus(subscription.status),
      billingInterval: interval,
      trialEndsAt: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000)
        : null,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription) {
  // Find tenant by subscription ID
  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  
  if (!tenant) {
    console.warn("No tenant found for subscription:", subscription.id);
    return;
  }
  
  const priceId = subscription.items.data[0]?.price?.id;
  const planId = getPlanFromPriceId(priceId) || tenant.subscriptionTier;
  const interval = subscription.items.data[0]?.price?.recurring?.interval;
  
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      stripePriceId: priceId,
      subscriptionTier: planId,
      subscriptionStatus: mapSubscriptionStatus(subscription.status),
      billingInterval: interval,
      trialEndsAt: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000)
        : null,
      subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  console.log("Subscription deleted:", subscription.id);
  
  // Find tenant by subscription ID
  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  
  if (!tenant) {
    console.log("No tenant found for subscription:", subscription.id);
    return;
  }
  
  // Downgrade to free plan
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      subscriptionTier: "free",
      subscriptionStatus: "canceled",
      billingInterval: null,
      trialEndsAt: null,
      subscriptionEndsAt: null,
      cancelAtPeriodEnd: false,
    },
  });
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(invoice) {
  if (!invoice.subscription) return;
  
  // Find tenant by subscription ID
  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: invoice.subscription },
  });
  
  if (!tenant) {
    console.warn("No tenant found for subscription:", invoice.subscription);
    return;
  }
  
  // Update subscription status to active
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus: "active",
    },
  });
}

/**
 * Handle invoice.payment_failed event
 */
async function handlePaymentFailed(invoice) {
  console.log("Payment failed:", invoice.id);
  
  if (!invoice.subscription) return;
  
  // Find tenant by subscription ID
  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: invoice.subscription },
  });
  
  if (!tenant) {
    console.log("No tenant found for subscription:", invoice.subscription);
    return;
  }
  
  // Update subscription status to past_due
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus: "past_due",
    },
  });
  
  // TODO: Send notification to tenant admins about payment failure
}

/**
 * Handle customer.subscription.trial_will_end event
 * Called 3 days before trial ends
 */
async function handleTrialWillEnd(subscription) {
  // Find tenant by subscription ID
  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  
  if (!tenant) {
    console.log("No tenant found for subscription:", subscription.id);
    return;
  }
  
  // TODO: Send notification to tenant admins about trial ending
  console.log(`Trial ending soon for tenant: ${tenant.id}`);
}
