import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { PRICING_PLANS, getPlanFromPriceId } from "@/lib/stripe";

// In-memory store for validated sessions (in production, use Redis or database)
const validatedSessions = new Map();

/**
 * GET /api/onboarding/validate-session
 * Validate a Stripe checkout session for onboarding
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Check if we have Stripe configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (stripeSecretKey) {
      // Real Stripe validation
      const stripe = (await import("stripe")).default;
      const stripeClient = new stripe(stripeSecretKey, {
        apiVersion: "2024-12-18.acacia",
      });

      try {
        const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
          expand: ["subscription", "customer"],
        });

        if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
          return NextResponse.json(
            { error: "Payment not completed" },
            { status: 400 }
          );
        }

        // Get plan details
        const subscription = session.subscription;
        const priceId = subscription?.items?.data[0]?.price?.id;
        const planId = getPlanFromPriceId(priceId) || "pro";
        const plan = PRICING_PLANS[planId] || PRICING_PLANS.pro;

        // Store validated session for later use
        validatedSessions.set(sessionId, {
          customerId: session.customer?.id || session.customer,
          subscriptionId: subscription?.id,
          planId,
          email: session.customer_email || session.customer?.email,
          validatedAt: new Date(),
        });

        return NextResponse.json({
          valid: true,
          planId,
          planName: plan.name,
          email: session.customer_email || session.customer?.email,
          customerId: session.customer?.id || session.customer,
          subscriptionId: subscription?.id,
        });
      } catch (stripeError) {
        console.error("Stripe session retrieval error:", stripeError);
        return NextResponse.json(
          { error: "Invalid or expired session" },
          { status: 400 }
        );
      }
    } else {
      // Mock validation for development without Stripe
      console.log("⚠️ Stripe not configured, using mock validation");

      // Check if this looks like a valid session ID format
      if (!sessionId.startsWith("cs_") && !sessionId.startsWith("mock_")) {
        // For development, accept any session ID
        console.log("Using mock session for development");
      }

      // Mock session data
      const mockData = {
        valid: true,
        planId: "pro",
        planName: "Pro",
        email: null, // Will be set during account creation
        customerId: `mock_cus_${Date.now()}`,
        subscriptionId: `mock_sub_${Date.now()}`,
        isMock: true,
      };

      // Store mock validated session
      validatedSessions.set(sessionId, {
        ...mockData,
        validatedAt: new Date(),
      });

      return NextResponse.json(mockData);
    }
  } catch (error) {
    console.error("Error validating session:", error);
    return NextResponse.json(
      { error: "Failed to validate session" },
      { status: 500 }
    );
  }
}

/**
 * Export the validated sessions store for use in other routes
 */
export { validatedSessions };
