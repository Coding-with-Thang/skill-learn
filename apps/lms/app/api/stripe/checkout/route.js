import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
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
      throw new AppError("Invalid plan", ErrorType.VALIDATION, { status: 400 });
    }
    
    if (planId === "free") {
      throw new AppError("Free plan doesn't require payment", ErrorType.VALIDATION, { status: 400, redirectToSignup: true });
    }
    if (planId === "enterprise" && !plan.priceId?.[interval]) {
      throw new AppError("Enterprise plan requires contacting sales", ErrorType.VALIDATION, { status: 400, contactSales: true });
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
      
      if (dbUser?.tenant?.stripeSubscriptionId) {
        throw new AppError("You already have an active subscription. Please manage it from the billing portal.", ErrorType.VALIDATION, { status: 400, redirectToPortal: true });
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
    return handleApiError(error);
  }
}
