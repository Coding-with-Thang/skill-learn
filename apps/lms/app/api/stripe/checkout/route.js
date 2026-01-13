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
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await currentUser();
    const { planId, interval = "monthly" } = await request.json();
    
    // Validate plan
    const plan = PRICING_PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    
    // Free plan doesn't need checkout
    if (planId === "free") {
      return NextResponse.json({ error: "Free plan doesn't require payment" }, { status: 400 });
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
    if (!priceId) {
      return NextResponse.json({ 
        error: `Price not configured for ${planId} ${interval} plan. Please contact support.` 
      }, { status: 400 });
    }
    
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
      // Redirect to billing portal instead
      return NextResponse.json({
        error: "You already have an active subscription. Please manage it from the billing portal.",
        redirectToPortal: true,
      }, { status: 400 });
    }
    
    // Create or get Stripe customer
    let customerId = dbUser?.tenant?.stripeCustomerId;
    if (!customerId) {
      const customer = await getOrCreateCustomer({
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
        tenantId: dbUser?.tenantId,
        metadata: {
          clerkUserId: userId,
        },
      });
      customerId = customer.id;
    }
    
    // Determine URLs
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;
    const successUrl = `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/pricing?canceled=true`;
    
    // Create checkout session
    const session = await createCheckoutSession({
      customerId,
      priceId,
      tenantId: dbUser?.tenantId,
      userId,
      successUrl,
      cancelUrl,
      trialDays: planId === "pro" ? 14 : 0, // 14-day trial for Pro plan
      allowPromotionCodes: true,
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
