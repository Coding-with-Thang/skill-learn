import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import {
  stripe,
  PRICING_PLANS,
  getOrCreateCustomer,
  createCheckoutSession,
} from "@/lib/stripe";

/**
 * POST /api/stripe/checkout
 * Create a Stripe checkout session for subscription
 * 
 * Supports two flows:
 * 1. Authenticated user upgrading/subscribing
 * 2. New user onboarding (payment first, then account creation)
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { 
      planId, 
      interval = "monthly",
      isOnboarding = false,
      email: providedEmail,
    } = body;
    
    // Validate plan
    const plan = PRICING_PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    
    // Free plan doesn't need checkout
    if (planId === "free") {
      return NextResponse.json({ 
        error: "Free plan doesn't require payment",
        redirectToSignup: true,
      }, { status: 400 });
    }
    
    // Enterprise plan needs contact sales
    if (planId === "enterprise" && !plan.priceId?.[interval]) {
      return NextResponse.json({ 
        error: "Enterprise plan requires contacting sales",
        contactSales: true 
      }, { status: 400 });
    }
    
    // Get price ID for the selected interval
    const priceId = plan.priceId?.[interval];
    
    // Determine URLs based on flow
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;
    let successUrl, cancelUrl;
    
    if (isOnboarding || !userId) {
      // New user onboarding flow - redirect to onboarding after payment
      successUrl = `${origin}/onboarding/start?session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${origin}/pricing?canceled=true`;
    } else {
      // Existing user flow - redirect to billing success
      successUrl = `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
      cancelUrl = `${origin}/pricing?canceled=true`;
    }
    
    // For development without Stripe configured
    if (!priceId || !process.env.STRIPE_SECRET_KEY) {
      console.log("⚠️ Stripe not fully configured, returning mock session");
      const mockSessionId = `mock_cs_${Date.now()}_${planId}`;
      return NextResponse.json({
        sessionId: mockSessionId,
        url: successUrl.replace("{CHECKOUT_SESSION_ID}", mockSessionId),
        isMock: true,
      });
    }
    
    let customerId = null;
    let customerEmail = providedEmail;
    let tenantId = null;
    
    // If user is authenticated, get their info
    if (userId) {
      const user = await currentUser();
      customerEmail = user?.emailAddresses[0]?.emailAddress;
      
      // Get user's tenant (if exists)
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { 
          id: true,
          tenantId: true, 
          tenant: {
            select: {
              id: true,
              stripeCustomerId: true,
              stripeSubscriptionId: true,
              subscriptionTier: true,
            }
          }
        },
      });
      
      // Check if user already has an active subscription
      if (dbUser?.tenant?.stripeSubscriptionId) {
        return NextResponse.json({
          error: "You already have an active subscription. Please manage it from the billing portal.",
          redirectToPortal: true,
        }, { status: 400 });
      }
      
      customerId = dbUser?.tenant?.stripeCustomerId;
      tenantId = dbUser?.tenantId;
      
      // Create customer if needed for authenticated users
      if (!customerId && customerEmail) {
        const customer = await getOrCreateCustomer({
          email: customerEmail,
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.username,
          tenantId: tenantId,
          metadata: {
            clerkUserId: userId,
          },
        });
        customerId = customer.id;
      }
    }
    
    // Create checkout session
    const session = await createCheckoutSession({
      customerId,
      customerEmail,
      priceId,
      planId,
      tenantId,
      userId,
      successUrl,
      cancelUrl,
      trialDays: planId === "pro" ? 14 : 0, // 14-day trial for Pro plan
      allowPromotionCodes: true,
      isOnboarding: isOnboarding || !userId,
    });
    
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
