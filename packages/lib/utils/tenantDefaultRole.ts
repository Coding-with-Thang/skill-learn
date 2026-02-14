import { prisma } from "@skill-learn/database";

/**
 * Guest role: built-in view-only default for every tenant.
 * Guest permissions (GUEST_PERMISSION_NAMES) must exist in the Permission table
 * or the Guest role is created with no permissions.
 */

/** Built-in default role alias for every tenant (view-only guest). */
export const GUEST_ROLE_ALIAS = "Guest";

/** View-only permission names for the Guest role (content and features enabled for tenant). */
export const GUEST_PERMISSION_NAMES = [
  "categories.read",
  "quizzes.read",
  "courses.read",
  "rewards.read",
  "games.read",
  "leaderboard.view",
  "points.view",
  "users.read",
  "roles.read",
  "settings.view",
];

/**
 * Ensures the tenant has a Guest role and sets it as the default role if none is set.
 * The Guest role does not count toward the tenant's role slot limit.
 * Idempotent: safe to call multiple times.
 *
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<{ id: string, roleAlias: string }>} The default (Guest) role
 */
export async function ensureTenantHasGuestRole(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, defaultRoleId: true },
  });
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  let guestRole = await prisma.tenantRole.findFirst({
    where: {
      tenantId,
      roleAlias: { equals: GUEST_ROLE_ALIAS, mode: "insensitive" },
    },
    select: { id: true, roleAlias: true },
  });

  if (!guestRole) {
    const permissions = await prisma.permission.findMany({
      where: {
        name: { in: GUEST_PERMISSION_NAMES },
        isActive: true,
      },
      select: { id: true },
    });
    const permissionIds = permissions.map((p) => p.id);

    guestRole = await prisma.tenantRole.create({
      data: {
        tenantId,
        roleAlias: GUEST_ROLE_ALIAS,
        description: "View-only access to content and features enabled for the tenant.",
        slotPosition: 0,
        isActive: true,
        doesNotCountTowardSlotLimit: true,
        tenantRolePermissions: permissionIds.length
          ? {
              create: permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      select: { id: true, roleAlias: true },
    });
  }

  if (!tenant.defaultRoleId) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { defaultRoleId: guestRole.id },
    });
  }

  return guestRole;
}

/**
 * Gets the tenant's default role ID (Guest if none set). Ensures Guest exists and default is set first.
 *
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<string|null>} Default role ID or null if tenant not found
 */
export async function getTenantDefaultRoleId(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { defaultRoleId: true },
  });
  if (!tenant) return null;
  if (tenant.defaultRoleId) return tenant.defaultRoleId;
  const { id } = await ensureTenantHasGuestRole(tenantId);
  return id;
}

/**
 * Ensures a user in a tenant has at least one role; assigns the tenant's default role if they have none.
 * Call from getTenantContext or when loading user with tenant.
 *
 * @param {string} userId - Clerk user ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} True if an assignment was added
 */
export async function ensureUserHasDefaultRole(userId, tenantId) {
  const existing = await prisma.userRole.findFirst({
    where: { userId, tenantId },
    select: { id: true },
  });
  if (existing) return false;

  const defaultRoleId = await getTenantDefaultRoleId(tenantId);
  if (!defaultRoleId) return false;

  await prisma.userRole.create({
    data: {
      userId,
      tenantId,
      tenantRoleId: defaultRoleId,
      assignedBy: "system",
    },
  });
  return true;
}
