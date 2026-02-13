import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requirePermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions";
import { requireTenantContext } from "@skill-learn/lib/utils/tenant";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";

/**
 * GET /api/tenant/billing
 * Get billing information for the tenant
 * Requires: billing.view permission
 */
export async function GET(_request: NextRequest) {
  try {
    // Get tenant context using standardized utility
    const tenantContext = await requireTenantContext();
    if (tenantContext instanceof NextResponse) {
      return tenantContext;
    }

    const { tenantId } = tenantContext;

    // Check permission
    const permResult = await requirePermission(PERMISSIONS.BILLING_VIEW, tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    // Get tenant with billing info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        roleSlotPurchases: {
          orderBy: { purchasedAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            users: true,
            tenantRoles: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new AppError("Tenant not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    // Calculate billing info
    const subscriptionTiers = {
      free: {
        name: "Free",
        price: 0,
        maxUsers: 10,
        maxRoleSlots: 3,
        features: [
          "Up to 10 users",
          "5 courses",
          "Basic quizzes",
          "Point system",
          "Basic leaderboard",
          "Community support",
        ],
      },
      starter: {
        name: "Starter",
        price: 15,
        maxUsers: 25,
        maxRoleSlots: 5,
        features: [
          "Up to 25 users",
          "Unlimited courses",
          "Advanced quizzes",
          "Gamification suite",
          "Full leaderboard",
          "Email support",
          "Advanced analytics",
          "Custom branding",
        ],
      },
      pro: {
        name: "Pro",
        price: 29,
        maxUsers: 100,
        maxRoleSlots: 5,
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
        name: "Enterprise",
        price: 99,
        maxUsers: -1, // Unlimited
        maxRoleSlots: 10,
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

    const currentTier = subscriptionTiers[tenant.subscriptionTier] || subscriptionTiers.free;

    // Calculate total spent on role slot purchases
    const totalSlotSpend = tenant.roleSlotPurchases
      .filter((p) => p.status === "active")
      .reduce((sum, p) => sum + p.totalPrice, 0);

    // Get subscription data from tenant
    const subscriptionData = {
      status: tenant.subscriptionStatus || "active",
      currentPeriodStart: tenant.updatedAt || new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: tenant.subscriptionEndsAt || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: tenant.cancelAtPeriodEnd || false,
      trialEndsAt: tenant.trialEndsAt,
      billingInterval: tenant.billingInterval || "monthly",
    };

    return NextResponse.json({
      billing: {
        // Subscription info
        subscription: {
          tier: tenant.subscriptionTier,
          tierName: currentTier.name,
          monthlyPrice: currentTier.price,
          status: subscriptionData.status,
          currentPeriodStart: subscriptionData.currentPeriodStart,
          currentPeriodEnd: subscriptionData.currentPeriodEnd,
          cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
          trialEndsAt: subscriptionData.trialEndsAt,
          billingInterval: subscriptionData.billingInterval,
          daysRemaining: Math.ceil(
            (new Date(subscriptionData.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24)
          ),
        },

        // Plan limits and usage
        usage: {
          users: {
            current: tenant._count.users,
            limit: currentTier.maxUsers === -1 ? "Unlimited" : currentTier.maxUsers,
            percentage:
              currentTier.maxUsers === -1
                ? 0
                : Math.round((tenant._count.users / currentTier.maxUsers) * 100),
          },
          roleSlots: {
            current: tenant._count.tenantRoles,
            limit: tenant.maxRoleSlots,
            base: tenant.baseRoleSlots,
            purchased: tenant.purchasedRoleSlots,
            percentage: Math.round((tenant._count.tenantRoles / tenant.maxRoleSlots) * 100),
          },
        },

        // Features
        features: currentTier.features,

        // Payment history (role slot purchases)
        recentPayments: tenant.roleSlotPurchases.map((p) => ({
          id: p.id,
          description: `${p.slotsPurchased} additional role slot(s)`,
          amount: p.totalPrice,
          status: p.status,
          date: p.purchasedAt,
        })),

        // Summary
        summary: {
          monthlyTotal: currentTier.price,
          additionalCharges: totalSlotSpend,
          stripeCustomerId: tenant.stripeCustomerId,
          stripeSubscriptionId: tenant.stripeSubscriptionId,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
