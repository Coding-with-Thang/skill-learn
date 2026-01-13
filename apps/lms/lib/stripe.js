import Stripe from "stripe";

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: false,
});

// Pricing plans configuration
// These should match your Stripe product/price IDs
export const PRICING_PLANS = {
  free: {
    id: "free",
    name: "Free",
    description: "Perfect for small teams getting started",
    priceId: null, // Free plan doesn't need a Stripe price
    price: {
      monthly: 0,
      annually: 0,
    },
    limits: {
      users: 10,
      courses: 5,
      storage: "1 GB",
    },
    features: [
      "Up to 10 users",
      "5 courses",
      "Basic quizzes",
      "Point system",
      "Basic leaderboard",
      "Community support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For growing organizations",
    // Replace with your actual Stripe price IDs
    priceId: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      annually: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    },
    price: {
      monthly: 29,
      annually: 24, // per month when billed annually
    },
    limits: {
      users: 100,
      courses: -1, // unlimited
      storage: "25 GB",
    },
    features: [
      "Up to 100 users",
      "Unlimited courses",
      "Advanced quizzes",
      "Full gamification suite",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Email support",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    // Enterprise uses custom pricing
    priceId: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
      annually: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
    },
    price: {
      monthly: "custom",
      annually: "custom",
    },
    limits: {
      users: -1, // unlimited
      courses: -1,
      storage: "Unlimited",
    },
    features: [
      "Unlimited users",
      "Unlimited courses",
      "Advanced quizzes",
      "Full gamification",
      "Enterprise analytics",
      "White-label solution",
      "Full API access",
      "SSO/SAML/SCIM",
      "Dedicated CSM",
      "SOC 2 compliance",
      "24/7 phone support",
      "SLA guarantee",
    ],
  },
};

/**
 * Get plan by ID
 */
export function getPlan(planId) {
  return PRICING_PLANS[planId] || null;
}

/**
 * Get all available plans
 */
export function getAllPlans() {
  return Object.values(PRICING_PLANS);
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  tenantId,
  userId,
  successUrl,
  cancelUrl,
  trialDays = 14,
  allowPromotionCodes = true,
}) {
  const sessionParams = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: allowPromotionCodes,
    billing_address_collection: "required",
    metadata: {
      tenantId,
      userId,
    },
  };

  // If customer exists, use their ID
  if (customerId) {
    sessionParams.customer = customerId;
  } else {
    // Allow Stripe to create a new customer
    sessionParams.customer_creation = "always";
  }

  // Add trial period for new subscriptions
  if (trialDays > 0 && !customerId) {
    sessionParams.subscription_data = {
      trial_period_days: trialDays,
      metadata: {
        tenantId,
        userId,
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session;
}

/**
 * Create a Stripe billing portal session
 */
export async function createPortalSession({ customerId, returnUrl }) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId) {
  if (!subscriptionId) return null;

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method", "latest_invoice"],
    });
    return subscription;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(subscriptionId) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return subscription;
}

/**
 * Resume a cancelled subscription
 */
export async function resumeSubscription(subscriptionId) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
  return subscription;
}

/**
 * Update subscription to a new plan
 */
export async function updateSubscription(subscriptionId, newPriceId) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: "create_prorations",
  });
  
  return updatedSubscription;
}

/**
 * Create or get Stripe customer for tenant
 */
export async function getOrCreateCustomer({ email, name, tenantId, metadata = {} }) {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      tenantId,
      ...metadata,
    },
  });

  return customer;
}

/**
 * Map Stripe subscription status to internal status
 */
export function mapSubscriptionStatus(stripeStatus) {
  const statusMap = {
    active: "active",
    past_due: "past_due",
    unpaid: "unpaid",
    canceled: "canceled",
    incomplete: "incomplete",
    incomplete_expired: "expired",
    trialing: "trialing",
    paused: "paused",
  };
  return statusMap[stripeStatus] || "unknown";
}

/**
 * Get plan ID from Stripe price ID
 */
export function getPlanFromPriceId(priceId) {
  for (const [planId, plan] of Object.entries(PRICING_PLANS)) {
    if (plan.priceId?.monthly === priceId || plan.priceId?.annually === priceId) {
      return planId;
    }
  }
  return null;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(payload, signature, webhookSecret) {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    throw error;
  }
}

export default stripe;
