import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";

/**
 * Permission checking utilities for multi-tenant RBAC
 * These utilities help enforce fine-grained permissions in API routes
 */

/**
 * Get all permissions for a user in a specific tenant
 * @param {string} userId - Clerk user ID
 * @param {string} tenantId - Tenant ID (optional, gets all if not provided)
 * @returns {Promise<Set<string>>} Set of permission names
 */
export async function getUserPermissions(userId, tenantId = null) {
  const where = { userId };
  if (tenantId) {
    where.tenantId = tenantId;
  }

  const userRoles = await prisma.userRole.findMany({
    where,
    include: {
      tenantRole: {
        select: {
          isActive: true,
          tenantRolePermissions: {
            include: {
              permission: {
                select: {
                  name: true,
                  isActive: true,
                  isDeprecated: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const permissions = new Set();
  for (const userRole of userRoles) {
    if (!userRole.tenantRole.isActive) continue;
    for (const trp of userRole.tenantRole.tenantRolePermissions) {
      if (trp.permission.isActive && !trp.permission.isDeprecated) {
        permissions.add(trp.permission.name);
      }
    }
  }

  return permissions;
}

/**
 * Check if user has a specific permission
 * @param {string} userId - Clerk user ID
 * @param {string} permission - Permission name to check
 * @param {string} tenantId - Tenant ID (optional)
 * @returns {Promise<boolean>}
 */
export async function hasPermission(userId, permission, tenantId = null) {
  const permissions = await getUserPermissions(userId, tenantId);
  return permissions.has(permission);
}

/**
 * Check if user has any of the specified permissions
 * @param {string} userId - Clerk user ID
 * @param {string[]} permissionList - List of permission names
 * @param {string} tenantId - Tenant ID (optional)
 * @returns {Promise<boolean>}
 */
export async function hasAnyPermission(userId, permissionList, tenantId = null) {
  const permissions = await getUserPermissions(userId, tenantId);
  return permissionList.some((p) => permissions.has(p));
}

/**
 * Check if user has all of the specified permissions
 * @param {string} userId - Clerk user ID
 * @param {string[]} permissionList - List of permission names
 * @param {string} tenantId - Tenant ID (optional)
 * @returns {Promise<boolean>}
 */
export async function hasAllPermissions(userId, permissionList, tenantId = null) {
  const permissions = await getUserPermissions(userId, tenantId);
  return permissionList.every((p) => permissions.has(p));
}

/**
 * Require specific permission for an API route
 * Returns 401 if not authenticated, 403 if permission denied
 * @param {string} permission - Permission name required
 * @param {string} tenantId - Tenant ID (optional)
 * @returns {Promise<{userId: string, permissions: Set<string>} | NextResponse>}
 */
export async function requirePermission(permission, tenantId = null) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = await getUserPermissions(userId, tenantId);

  if (!permissions.has(permission)) {
    return NextResponse.json(
      {
        error: "Permission denied",
        required: permission,
        message: `You need the "${permission}" permission to perform this action`,
      },
      { status: 403 }
    );
  }

  return { userId, permissions };
}

/**
 * Require any of the specified permissions for an API route
 * @param {string[]} permissionList - List of permission names (any one grants access)
 * @param {string} tenantId - Tenant ID (optional)
 * @returns {Promise<{userId: string, permissions: Set<string>} | NextResponse>}
 */
export async function requireAnyPermission(permissionList, tenantId = null) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = await getUserPermissions(userId, tenantId);
  const hasAny = permissionList.some((p) => permissions.has(p));

  if (!hasAny) {
    return NextResponse.json(
      {
        error: "Permission denied",
        required: permissionList,
        message: `You need one of these permissions: ${permissionList.join(", ")}`,
      },
      { status: 403 }
    );
  }

  return { userId, permissions };
}

/**
 * Require all of the specified permissions for an API route
 * @param {string[]} permissionList - List of permission names (all required)
 * @param {string} tenantId - Tenant ID (optional)
 * @returns {Promise<{userId: string, permissions: Set<string>} | NextResponse>}
 */
export async function requireAllPermissions(permissionList, tenantId = null) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = await getUserPermissions(userId, tenantId);
  const missingPermissions = permissionList.filter((p) => !permissions.has(p));

  if (missingPermissions.length > 0) {
    return NextResponse.json(
      {
        error: "Permission denied",
        required: permissionList,
        missing: missingPermissions,
        message: `Missing required permissions: ${missingPermissions.join(", ")}`,
      },
      { status: 403 }
    );
  }

  return { userId, permissions };
}

/**
 * Get user's tenant memberships with roles
 * @param {string} userId - Clerk user ID
 * @returns {Promise<Array>}
 */
export async function getUserTenants(userId) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tenantRole: {
        select: {
          id: true,
          roleAlias: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      assignedAt: "desc",
    },
  });

  // Group by tenant
  const tenantMap = new Map();
  for (const ur of userRoles) {
    const tenantKey = ur.tenant.id;
    if (!tenantMap.has(tenantKey)) {
      tenantMap.set(tenantKey, {
        tenant: ur.tenant,
        roles: [],
      });
    }
    if (ur.tenantRole.isActive) {
      tenantMap.get(tenantKey).roles.push({
        id: ur.tenantRole.id,
        roleAlias: ur.tenantRole.roleAlias,
        assignedAt: ur.assignedAt,
      });
    }
  }

  return Array.from(tenantMap.values());
}

/**
 * Check if user belongs to a specific tenant
 * @param {string} userId - Clerk user ID
 * @param {string} tenantId - Tenant ID to check
 * @returns {Promise<boolean>}
 */
export async function isUserInTenant(userId, tenantId) {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      tenantId,
      tenantRole: {
        isActive: true,
      },
    },
  });

  return !!userRole;
}

/**
 * Require user to be a member of a specific tenant
 * @param {string} tenantId - Tenant ID required
 * @returns {Promise<{userId: string, tenantId: string} | NextResponse>}
 */
export async function requireTenantMembership(tenantId) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isMember = await isUserInTenant(userId, tenantId);

  if (!isMember) {
    return NextResponse.json(
      {
        error: "Access denied",
        message: "You are not a member of this organization",
      },
      { status: 403 }
    );
  }

  return { userId, tenantId };
}

/**
 * Common permission constants for easy reference
 */
export const PERMISSIONS = {
  // User Management
  USERS_CREATE: "users.create",
  USERS_READ: "users.read",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  USERS_IMPORT: "users.import",
  USERS_EXPORT: "users.export",

  // Quiz Management
  QUIZZES_CREATE: "quizzes.create",
  QUIZZES_READ: "quizzes.read",
  QUIZZES_UPDATE: "quizzes.update",
  QUIZZES_DELETE: "quizzes.delete",
  QUIZZES_PUBLISH: "quizzes.publish",
  QUIZZES_ASSIGN: "quizzes.assign",

  // Course Management
  COURSES_CREATE: "courses.create",
  COURSES_READ: "courses.read",
  COURSES_UPDATE: "courses.update",
  COURSES_DELETE: "courses.delete",
  COURSES_PUBLISH: "courses.publish",

  // Category Management
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_READ: "categories.read",
  CATEGORIES_UPDATE: "categories.update",
  CATEGORIES_DELETE: "categories.delete",

  // Rewards Management
  REWARDS_CREATE: "rewards.create",
  REWARDS_READ: "rewards.read",
  REWARDS_UPDATE: "rewards.update",
  REWARDS_DELETE: "rewards.delete",
  REWARDS_APPROVE: "rewards.approve",
  REWARDS_FULFILL: "rewards.fulfill",

  // Points Management
  POINTS_VIEW: "points.view",
  POINTS_GRANT: "points.grant",
  POINTS_DEDUCT: "points.deduct",
  POINTS_HISTORY: "points.history",

  // Games Management
  GAMES_CREATE: "games.create",
  GAMES_READ: "games.read",
  GAMES_UPDATE: "games.update",
  GAMES_DELETE: "games.delete",

  // Reports
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",
  REPORTS_CREATE: "reports.create",
  REPORTS_SCHEDULE: "reports.schedule",

  // Leaderboard
  LEADERBOARD_VIEW: "leaderboard.view",
  LEADERBOARD_MANAGE: "leaderboard.manage",

  // Audit
  AUDIT_VIEW: "audit.view",
  AUDIT_EXPORT: "audit.export",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_UPDATE: "settings.update",

  // Roles
  ROLES_CREATE: "roles.create",
  ROLES_READ: "roles.read",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",
  ROLES_ASSIGN: "roles.assign",

  // Billing
  BILLING_VIEW: "billing.view",
  BILLING_MANAGE: "billing.manage",

  // Dashboard
  DASHBOARD_ADMIN: "dashboard.admin",
  DASHBOARD_MANAGER: "dashboard.manager",

  // Flash Cards
  FLASHCARDS_CREATE: "flashcards.create",
  FLASHCARDS_READ: "flashcards.read",
  FLASHCARDS_UPDATE: "flashcards.update",
  FLASHCARDS_DELETE: "flashcards.delete",
  FLASHCARDS_MANAGE_TENANT: "flashcards.manage_tenant", // Admin: manage all tenant cards
  FLASHCARDS_MANAGE_GLOBAL: "flashcards.manage_global", // Super admin: manage global cards

  // Media (browse/upload for tenant-scoped media library)
  MEDIA_BROWSE: "media.browse",
  MEDIA_UPLOAD: "media.upload",
};

export default {
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  getUserTenants,
  isUserInTenant,
  requireTenantMembership,
  PERMISSIONS,
};

// Re-export tenant utilities for convenience
export {
  getTenantContext,
  getTenantContextForAction,
  getTenantId,
  requireTenantContext,
  buildTenantContentFilter,
  buildTenantOnlyFilter,
} from "./tenant.js";
