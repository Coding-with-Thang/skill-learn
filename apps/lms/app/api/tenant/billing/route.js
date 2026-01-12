import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { requirePermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions.js";

/**
 * GET /api/tenant/billing
 * Get billing information for the tenant
 * Requires: billing.view permission
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant assigned" }, { status: 400 });
    }

    // Check permission
    const permResult = await requirePermission(PERMISSIONS.BILLING_VIEW, user.tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    // Get tenant with billing info
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
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
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Calculate billing info
    const subscriptionTiers = {
      trial: {
        name: "Trial",
        price: 0,
        maxUsers: 10,
        maxRoleSlots: 3,
        features: ["Basic quizzes", "Limited courses", "Email support"],
      },
      professional: {
        name: "Professional",
        price: 49,
        maxUsers: 100,
        maxRoleSlots: 5,
        features: [
          "Unlimited quizzes",
          "Unlimited courses",
          "Custom roles",
          "Reports & Analytics",
          "Priority support",
        ],
      },
      enterprise: {
        name: "Enterprise",
        price: 199,
        maxUsers: -1, // Unlimited
        maxRoleSlots: 10,
        features: [
          "Everything in Professional",
          "Unlimited users",
          "Custom branding",
          "API access",
          "Dedicated support",
          "SLA guarantee",
        ],
      },
    };

    const currentTier = subscriptionTiers[tenant.subscriptionTier] || subscriptionTiers.professional;

    // Calculate total spent on role slot purchases
    const totalSlotSpend = tenant.roleSlotPurchases
      .filter((p) => p.status === "active")
      .reduce((sum, p) => sum + p.totalPrice, 0);

    // Mock subscription data (in production, this would come from Stripe)
    const mockSubscription = {
      status: "active",
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      cancelAtPeriodEnd: false,
    };

    return NextResponse.json({
      billing: {
        // Subscription info
        subscription: {
          tier: tenant.subscriptionTier,
          tierName: currentTier.name,
          monthlyPrice: currentTier.price,
          status: mockSubscription.status,
          currentPeriodStart: mockSubscription.currentPeriodStart,
          currentPeriodEnd: mockSubscription.currentPeriodEnd,
          cancelAtPeriodEnd: mockSubscription.cancelAtPeriodEnd,
          daysRemaining: Math.ceil(
            (mockSubscription.currentPeriodEnd - new Date()) / (1000 * 60 * 60 * 24)
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
    console.error("Error fetching billing:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing information" },
      { status: 500 }
    );
  }
}
