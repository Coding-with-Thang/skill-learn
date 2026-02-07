import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";

/**
 * Sync user's tenant and permission metadata to Clerk
 * Call this after any role assignment changes
 * 
 * @param {string} userId - Clerk user ID
 * @param {string} tenantId - Tenant ID (optional, will lookup if not provided)
 */
export async function syncUserMetadataToClerk(userId, tenantId = null) {
  try {
    // If no tenantId provided, look up user's current tenant
    if (!tenantId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { tenantId: true },
      });
      tenantId = user?.tenantId;
    }

    // If still no tenant, clear metadata
    if (!tenantId) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          tenantId: null,
          tenantName: null,
          tenantSlug: null,
          roles: [],
          permissions: [],
          canAccessAdminDashboard: false,
          canManageUsers: false,
          canManageContent: false,
        },
      });
      console.log(`[ClerkSync] Cleared metadata for user ${userId}`);
      return;
    }

    // Get tenant and user roles with permissions
    const [tenant, userRoles] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, slug: true },
      }),
      prisma.userRole.findMany({
        where: {
          userId,
          tenantId,
          tenantRole: { isActive: true },
        },
        include: {
          tenantRole: {
            select: {
              roleAlias: true,
              tenantRolePermissions: {
                include: {
                  permission: {
                    select: { name: true, isActive: true, isDeprecated: true },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    if (!tenant) {
      console.warn(`[ClerkSync] Tenant ${tenantId} not found`);
      return;
    }

    // Collect roles and permissions
    const roles = userRoles.map((ur) => ur.tenantRole.roleAlias);
    const permissionSet = new Set();

    for (const ur of userRoles) {
      for (const trp of ur.tenantRole.tenantRolePermissions) {
        if (trp.permission.isActive && !trp.permission.isDeprecated) {
          permissionSet.add(trp.permission.name);
        }
      }
    }

    const permissions = Array.from(permissionSet);

    // Update Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        roles,
        permissions,
        // Quick access flags
        canAccessAdminDashboard: permissions.includes("dashboard.admin"),
        canManageUsers:
          permissions.includes("users.create") ||
          permissions.includes("users.update") ||
          permissions.includes("users.delete"),
        canManageContent:
          permissions.includes("quizzes.create") ||
          permissions.includes("courses.create") ||
          permissions.includes("content.create"),
        canViewReports: permissions.includes("reports.view"),
        canManageRoles:
          permissions.includes("roles.create") ||
          permissions.includes("roles.assign"),
      },
    });

    console.log(
      `[ClerkSync] Synced metadata for user ${userId}: ${roles.length} roles, ${permissions.length} permissions`
    );

    return { roles, permissions };
  } catch (error) {
    // User may have been deleted from Clerk but still exists in DB (e.g. different env or stale data)
    const isNotFound =
      error?.status === 404 ||
      error?.statusCode === 404 ||
      (error?.code === "api_response_error" && String(error?.message || "").includes("Not Found"));
    if (isNotFound) {
      console.warn(`[ClerkSync] Skipping sync for user ${userId}: not found in Clerk (404)`);
      return null;
    }
    console.error(`[ClerkSync] Failed to sync metadata for user ${userId}:`, error.message);
    throw error;
  }
}

/**
 * Sync all users in a tenant after role permission changes
 * Call this after updating a tenant role's permissions
 * 
 * @param {string} tenantId - Tenant ID
 * @param {string} roleId - The role that was updated (optional)
 */
export async function syncTenantUsersMetadata(tenantId, roleId = null) {
  try {
    // Get all users with roles in this tenant
    const whereClause = { tenantId };
    if (roleId) {
      whereClause.tenantRoleId = roleId;
    }

    const userRoles = await prisma.userRole.findMany({
      where: whereClause,
      select: { userId: true },
      distinct: ["userId"],
    });

    const userIds = userRoles.map((ur) => ur.userId);
    console.log(
      `[ClerkSync] Syncing ${userIds.length} users for tenant ${tenantId}`
    );

    // Sync each user (in batches to avoid rate limits)
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      await Promise.all(
        batch.map((userId) => syncUserMetadataToClerk(userId, tenantId))
      );
    }

    console.log(`[ClerkSync] Completed syncing ${userIds.length} users`);
    return { syncedCount: userIds.length };
  } catch (error) {
    console.error(`[ClerkSync] Failed to sync tenant users:`, error.message);
    throw error;
  }
}

/**
 * Assign a tenant to a user and sync metadata
 * 
 * @param {string} userId - Clerk user ID
 * @param {string} tenantId - Tenant ID to assign
 * @param {string} defaultRoleAlias - Role to assign (optional)
 */
export async function assignUserToTenant(userId, tenantId, defaultRoleAlias = null) {
  try {
    // Update user's tenant
    await prisma.user.update({
      where: { clerkId: userId },
      data: { tenantId },
    });

    // Assign default role if specified
    if (defaultRoleAlias) {
      const role = await prisma.tenantRole.findFirst({
        where: {
          tenantId,
          roleAlias: { equals: defaultRoleAlias, mode: "insensitive" },
          isActive: true,
        },
      });

      if (role) {
        // Check if already assigned
        const existing = await prisma.userRole.findFirst({
          where: { userId, tenantRoleId: role.id },
        });

        if (!existing) {
          await prisma.userRole.create({
            data: {
              userId,
              tenantId,
              tenantRoleId: role.id,
              assignedBy: "system",
            },
          });
        }
      }
    }

    // Sync metadata to Clerk
    await syncUserMetadataToClerk(userId, tenantId);

    console.log(`[ClerkSync] Assigned user ${userId} to tenant ${tenantId}`);
  } catch (error) {
    console.error(`[ClerkSync] Failed to assign user to tenant:`, error.message);
    throw error;
  }
}

/**
 * Remove a user from a tenant and clear metadata
 * 
 * @param {string} userId - Clerk user ID
 * @param {string} tenantId - Tenant ID to remove from
 */
export async function removeUserFromTenant(userId, tenantId) {
  try {
    // Remove all role assignments for this tenant
    await prisma.userRole.deleteMany({
      where: { userId, tenantId },
    });

    // Clear tenant from user
    await prisma.user.update({
      where: { clerkId: userId },
      data: { tenantId: null },
    });

    // Clear Clerk metadata
    await syncUserMetadataToClerk(userId, null);

    console.log(`[ClerkSync] Removed user ${userId} from tenant ${tenantId}`);
  } catch (error) {
    console.error(`[ClerkSync] Failed to remove user from tenant:`, error.message);
    throw error;
  }
}

export default {
  syncUserMetadataToClerk,
  syncTenantUsersMetadata,
  assignUserToTenant,
  removeUserFromTenant,
};
