import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { ensureUserHasDefaultRole } from "./tenantDefaultRole.js";

/**
 * Tenant context utilities for multi-tenant applications
 * These utilities standardize how tenant context is retrieved and validated
 */

/**
 * Get tenant context for the current authenticated user
 * Returns the user's tenantId and user record
 * 
 * @returns {Promise<{userId: string, tenantId: string, user: object} | NextResponse>}
 * Returns tenant context or NextResponse error if not authenticated or no tenant
 */
export async function getTenantContext() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
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
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  if (!user.tenantId) {
    return NextResponse.json(
      { 
        error: "No tenant assigned",
        message: "Please complete onboarding to set up your workspace",
        redirectTo: "/onboarding/workspace"
      },
      { status: 400 }
    );
  }

  await ensureUserHasDefaultRole(userId, user.tenantId);

  return {
    userId,
    tenantId: user.tenantId,
    user: {
      id: user.id,
      role: user.role,
      tenantId: user.tenantId,
    },
    tenant: user.tenant,
  };
}

/**
 * Get tenant context for the current authenticated user (non-API version)
 * Throws Error if not authenticated or no tenant (for server actions)
 * 
 * @returns {Promise<{userId: string, tenantId: string, user: object}>}
 * @throws {Error} If not authenticated or no tenant
 */
export async function getTenantContextForAction() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
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
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.tenantId) {
    throw new Error("No tenant assigned. Please complete onboarding.");
  }

  await ensureUserHasDefaultRole(userId, user.tenantId);

  return {
    userId,
    tenantId: user.tenantId,
    user: {
      id: user.id,
      role: user.role,
      tenantId: user.tenantId,
    },
    tenant: user.tenant,
  };
}

/**
 * Get tenant ID for the current authenticated user (simple version)
 * Returns null if user has no tenant (useful for optional tenant checks)
 * 
 * @returns {Promise<string | null>} Tenant ID or null
 */
export async function getTenantId() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { tenantId: true },
  });

  return user?.tenantId || null;
}

/**
 * Require tenant context - ensures user has a tenant
 * Returns NextResponse error if no tenant (for API routes)
 * 
 * @returns {Promise<{userId: string, tenantId: string} | NextResponse>}
 */
export async function requireTenantContext() {
  const context = await getTenantContext();
  
  if (context instanceof NextResponse) {
    return context;
  }

  return {
    userId: context.userId,
    tenantId: context.tenantId,
  };
}

/**
 * Build a tenant-aware query filter for global content
 * Returns Prisma where clause that includes tenant-specific and global content
 * 
 * @param {string} tenantId - User's tenant ID
 * @param {object} additionalFilters - Additional filters to apply
 * @returns {object} Prisma where clause
 * 
 * @example
 * const where = buildTenantContentFilter(tenantId, { isActive: true });
 * // Returns: { OR: [{ tenantId }, { isGlobal: true, tenantId: null }], isActive: true }
 */
export function buildTenantContentFilter(tenantId, additionalFilters = {}) {
  if (!tenantId) {
    // If no tenant, only show global content
    return {
      isGlobal: true,
      tenantId: null,
      ...additionalFilters,
    };
  }

  return {
    OR: [
      { tenantId: tenantId }, // Tenant-specific content
      { isGlobal: true, tenantId: null }, // Global content
    ],
    ...additionalFilters,
  };
}

/**
 * Build a tenant-only query filter (excludes global content)
 * Returns Prisma where clause for tenant-specific content only
 * 
 * @param {string} tenantId - User's tenant ID
 * @param {object} additionalFilters - Additional filters to apply
 * @returns {object} Prisma where clause
 */
export function buildTenantOnlyFilter(tenantId, additionalFilters = {}) {
  if (!tenantId) {
    return {
      tenantId: null,
      ...additionalFilters,
    };
  }

  return {
    tenantId: tenantId,
    ...additionalFilters,
  };
}

export default {
  getTenantContext,
  getTenantContextForAction,
  getTenantId,
  requireTenantContext,
  buildTenantContentFilter,
  buildTenantOnlyFilter,
};
