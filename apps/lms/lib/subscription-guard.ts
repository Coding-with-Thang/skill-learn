import { prisma } from "@skill-learn/database";

/**
 * Subscription status types
 */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  TRIALING: "trialing",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  INCOMPLETE: "incomplete",
  EXPIRED: "expired",
  NONE: "none",
};

/**
 * Access levels based on subscription
 */
export const ACCESS_LEVEL = {
  FULL: "full", // Full access to all features
  READ_ONLY: "read_only", // Can view but not create/edit
  LIMITED: "limited", // Limited features (e.g., free tier)
  BLOCKED: "blocked", // No access
  PAYMENT_REQUIRED: "payment_required", // Needs to pay
  ONBOARDING_REQUIRED: "onboarding_required", // Needs to complete onboarding
};

/**
 * Check user's subscription status and access level
 * @param {string} clerkUserId - Clerk user ID
 * @returns {Promise<{status: string, accessLevel: string, tenant: object|null, message: string}>}
 */
export async function checkSubscriptionAccess(clerkUserId) {
  if (!clerkUserId) {
    return {
      status: SUBSCRIPTION_STATUS.NONE,
      accessLevel: ACCESS_LEVEL.BLOCKED,
      tenant: null,
      message: "Not authenticated",
    };
  }

  try {
    // Get user with tenant info
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        tenantId: true,
        role: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            stripeSubscriptionId: true,
            trialEndsAt: true,
            subscriptionEndsAt: true,
            cancelAtPeriodEnd: true,
          },
        },
      },
    });

    // User doesn't exist in database
    if (!user) {
      return {
        status: SUBSCRIPTION_STATUS.NONE,
        accessLevel: ACCESS_LEVEL.ONBOARDING_REQUIRED,
        tenant: null,
        message: "Please complete onboarding",
        redirectTo: "/onboarding/workspace",
      };
    }

    // User has no tenant
    if (!user.tenantId || !user.tenant) {
      return {
        status: SUBSCRIPTION_STATUS.NONE,
        accessLevel: ACCESS_LEVEL.ONBOARDING_REQUIRED,
        tenant: null,
        message: "Please set up your workspace",
        redirectTo: "/onboarding/workspace",
      };
    }

    const tenant = user.tenant;
    const subscriptionStatus = tenant.subscriptionStatus || "active";

    // Check subscription status
    switch (subscriptionStatus) {
      case "active":
        return {
          status: SUBSCRIPTION_STATUS.ACTIVE,
          accessLevel: ACCESS_LEVEL.FULL,
          tenant,
          message: "Full access",
        };

      case "trialing":
        // Check if trial has expired
        if (tenant.trialEndsAt && new Date(tenant.trialEndsAt) < new Date()) {
          return {
            status: SUBSCRIPTION_STATUS.EXPIRED,
            accessLevel: ACCESS_LEVEL.PAYMENT_REQUIRED,
            tenant,
            message: "Trial expired. Please subscribe to continue.",
            redirectTo: "/pricing",
          };
        }
        return {
          status: SUBSCRIPTION_STATUS.TRIALING,
          accessLevel: ACCESS_LEVEL.FULL,
          tenant,
          message: tenant.trialEndsAt != null ? `Trial active until ${new Date(tenant.trialEndsAt).toLocaleDateString()}` : "Trial active",
        };

      case "past_due":
        return {
          status: SUBSCRIPTION_STATUS.PAST_DUE,
          accessLevel: ACCESS_LEVEL.READ_ONLY,
          tenant,
          message: "Payment past due. Please update your payment method.",
          showWarning: true,
          redirectTo: "/dashboard/billing",
        };

      case "canceled":
        // If subscription end date hasn't passed, allow read-only access
        if (tenant.subscriptionEndsAt && new Date(tenant.subscriptionEndsAt) > new Date()) {
          return {
            status: SUBSCRIPTION_STATUS.CANCELED,
            accessLevel: ACCESS_LEVEL.READ_ONLY,
            tenant,
            message: `Access until ${new Date(tenant.subscriptionEndsAt).toLocaleDateString()}`,
            showWarning: true,
          };
        }
        return {
          status: SUBSCRIPTION_STATUS.CANCELED,
          accessLevel: ACCESS_LEVEL.BLOCKED,
          tenant,
          message: "Subscription canceled. Please subscribe to continue.",
          redirectTo: "/pricing",
        };

      case "incomplete":
      case "expired":
        return {
          status: SUBSCRIPTION_STATUS.EXPIRED,
          accessLevel: ACCESS_LEVEL.PAYMENT_REQUIRED,
          tenant,
          message: "Payment required to access.",
          redirectTo: "/pricing",
        };

      default:
        // For free tier or unknown status
        if (tenant.subscriptionTier === "free") {
          return {
            status: SUBSCRIPTION_STATUS.ACTIVE,
            accessLevel: ACCESS_LEVEL.LIMITED,
            tenant,
            message: "Free plan - limited features",
          };
        }
        return {
          status: SUBSCRIPTION_STATUS.ACTIVE,
          accessLevel: ACCESS_LEVEL.FULL,
          tenant,
          message: "Access granted",
        };
    }
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    console.error("Error checking subscription access:", e);
    return {
      status: SUBSCRIPTION_STATUS.NONE,
      accessLevel: ACCESS_LEVEL.BLOCKED,
      tenant: null,
      message: "Error checking subscription",
      error: e.message,
    };
  }
}

/**
 * Check if access level allows the requested action
 */
export function canPerformAction(accessLevel, action) {
  const permissions = {
    [ACCESS_LEVEL.FULL]: ["read", "write", "delete", "admin"],
    [ACCESS_LEVEL.READ_ONLY]: ["read"],
    [ACCESS_LEVEL.LIMITED]: ["read", "write"], // Limited write access
    [ACCESS_LEVEL.BLOCKED]: [],
    [ACCESS_LEVEL.PAYMENT_REQUIRED]: [],
    [ACCESS_LEVEL.ONBOARDING_REQUIRED]: [],
  };

  return permissions[accessLevel]?.includes(action) || false;
}

/**
 * Server action to get subscription status for the current user
 */
export async function getSubscriptionStatus(clerkUserId) {
  const access = await checkSubscriptionAccess(clerkUserId);
  
  return {
    isActive: [ACCESS_LEVEL.FULL, ACCESS_LEVEL.LIMITED].includes(access.accessLevel),
    isTrialing: access.status === SUBSCRIPTION_STATUS.TRIALING,
    isPastDue: access.status === SUBSCRIPTION_STATUS.PAST_DUE,
    isCanceled: access.status === SUBSCRIPTION_STATUS.CANCELED,
    needsPayment: access.accessLevel === ACCESS_LEVEL.PAYMENT_REQUIRED,
    needsOnboarding: access.accessLevel === ACCESS_LEVEL.ONBOARDING_REQUIRED,
    canWrite: canPerformAction(access.accessLevel, "write"),
    canRead: canPerformAction(access.accessLevel, "read"),
    tenant: access.tenant,
    message: access.message,
    redirectTo: access.redirectTo,
    showWarning: access.showWarning,
  };
}
