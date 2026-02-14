import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import {
  stripe,
  getSubscription,
  PRICING_PLANS,
  cancelSubscription,
  resumeSubscription,
  updateSubscription,
  getPlanFromPriceId,
  mapSubscriptionStatus,
} from "@/lib/stripe";

/**
 * GET /api/stripe/subscription
 * Get current subscription details
 */
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
    }
    
    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { 
        tenantId: true,
        tenant: {
          select: {
            id: true,
            name: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            stripePriceId: true,
            billingInterval: true,
            trialEndsAt: true,
            subscriptionEndsAt: true,
            cancelAtPeriodEnd: true,
          }
        }
      },
    });
    
    if (!user?.tenant) {
      return NextResponse.json({
        subscription: null,
        plan: PRICING_PLANS.free,
        message: "No tenant assigned",
      });
    }
    
    const tenant = user.tenant;
    let stripeSubscription: Awaited<ReturnType<typeof getSubscription>> = null;

    // If there's a Stripe subscription, fetch the latest details
    if (tenant.stripeSubscriptionId) {
      stripeSubscription = await getSubscription(tenant.stripeSubscriptionId);
    }

    // Stripe SDK may return Response<Subscription>; use subscription shape for response
    const sub = stripeSubscription as {
      id: string; status: string; current_period_start: number; current_period_end: number;
      cancel_at_period_end: boolean; canceled_at: number | null; trial_start: number | null; trial_end: number | null;
      items?: { data: Array<{ price?: { recurring?: { interval?: string } } }> };
    } | null;

    // Get plan details
    const currentPlan = PRICING_PLANS[tenant.subscriptionTier] || PRICING_PLANS.free;

    // Build response
    const response = {
      subscription: sub ? {
        id: sub.id,
        status: sub.status,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        canceledAt: sub.canceled_at
          ? new Date(sub.canceled_at * 1000)
          : null,
        trialStart: sub.trial_start
          ? new Date(sub.trial_start * 1000)
          : null,
        trialEnd: sub.trial_end
          ? new Date(sub.trial_end * 1000)
          : null,
        interval: sub?.items?.data?.[0]?.price?.recurring?.interval || tenant.billingInterval,
      } : {
        id: null,
        status: tenant.subscriptionStatus,
        currentPeriodStart: null,
        currentPeriodEnd: tenant.subscriptionEndsAt,
        cancelAtPeriodEnd: tenant.cancelAtPeriodEnd,
        canceledAt: null,
        trialStart: null,
        trialEnd: tenant.trialEndsAt,
        interval: tenant.billingInterval,
      },
      plan: {
        id: tenant.subscriptionTier,
        name: currentPlan.name,
        description: currentPlan.description,
        price: currentPlan.price,
        limits: currentPlan.limits,
        features: currentPlan.features,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
      hasStripeCustomer: !!tenant.stripeCustomerId,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/stripe/subscription
 * Update subscription (cancel, resume, or change plan)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
    }
    
    const { action, newPlanId, interval } = await request.json();
    
    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { 
        tenantId: true,
        tenant: {
          select: {
            stripeSubscriptionId: true,
          }
        }
      },
    });
    
    if (!user?.tenant?.stripeSubscriptionId) {
      throw new AppError("No active subscription found", ErrorType.VALIDATION, { status: 400 });
    }
    
    const subscriptionId = user.tenant.stripeSubscriptionId;
    let result;
    
    switch (action) {
      case "cancel":
        // Cancel at period end
        result = await cancelSubscription(subscriptionId);
        return NextResponse.json({
          message: "Subscription will be canceled at the end of the billing period",
          cancelAt: new Date(result.current_period_end * 1000),
        });
        
      case "resume":
        // Resume a canceled subscription
        result = await resumeSubscription(subscriptionId);
        return NextResponse.json({
          message: "Subscription has been resumed",
        });
        
      case "change_plan":
        if (!newPlanId) {
          throw new AppError("New plan ID required", ErrorType.VALIDATION, { status: 400 });
        }
        const newPlan = PRICING_PLANS[newPlanId];
        if (!newPlan || newPlanId === "free") {
          throw new AppError("Invalid plan", ErrorType.VALIDATION, { status: 400 });
        }
        const billingInterval = interval || "monthly";
        const newPriceId = newPlan.priceId?.[billingInterval];
        if (!newPriceId) {
          throw new AppError("Price not configured for selected plan", ErrorType.VALIDATION, { status: 400 });
        }
        
        result = await updateSubscription(subscriptionId, newPriceId);
        return NextResponse.json({
          message: `Subscription updated to ${newPlan.name}`,
        });
        
      default:
        throw new AppError("Invalid action", ErrorType.VALIDATION, { status: 400 });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
