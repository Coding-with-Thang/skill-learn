import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/user-permissions
 * Get current user's permissions across all their tenant roles
 * This is used by the frontend to determine what the user can do
 */
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    // Build where clause
    const where = { userId };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    // Get all user role assignments
    const userRoles = await prisma.userRole.findMany({
      where,
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
            tenantRolePermissions: {
              include: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                    category: true,
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

    // Aggregate permissions from all active roles
    const permissionMap = new Map();
    const rolesByTenant = {};

    for (const userRole of userRoles) {
      // Skip inactive roles
      if (!userRole.tenantRole.isActive) {
        continue;
      }

      const tenantKey = userRole.tenant.id;
      if (!rolesByTenant[tenantKey]) {
        rolesByTenant[tenantKey] = {
          tenant: userRole.tenant,
          roles: [],
          permissions: new Set(),
        };
      }

      rolesByTenant[tenantKey].roles.push({
        id: userRole.tenantRole.id,
        roleAlias: userRole.tenantRole.roleAlias,
        assignedAt: userRole.assignedAt,
      });

      // Add permissions from this role
      for (const trp of userRole.tenantRole.tenantRolePermissions) {
        const perm = trp.permission;
        // Only include active, non-deprecated permissions
        if (perm.isActive && !perm.isDeprecated) {
          rolesByTenant[tenantKey].permissions.add(perm.name);
          permissionMap.set(perm.name, {
            id: perm.id,
            name: perm.name,
            displayName: perm.displayName,
            category: perm.category,
          });
        }
      }
    }

    // Convert to response format
    const tenantPermissions = Object.values(rolesByTenant).map((tp) => ({
      tenant: tp.tenant,
      roles: tp.roles,
      permissions: Array.from(tp.permissions),
    }));

    // Flatten all unique permissions for quick lookup
    const allPermissions = Array.from(permissionMap.keys());
    const permissionDetails = Array.from(permissionMap.values());

    // Group by category
    const permissionsByCategory = permissionDetails.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm.name);
      return acc;
    }, {});

    return NextResponse.json({
      userId,
      tenantPermissions,
      allPermissions,
      permissionsByCategory,
      // Helper functions for frontend
      hasPermission: (permName) => allPermissions.includes(permName),
      hasAnyPermission: (permNames) =>
        permNames.some((p) => allPermissions.includes(p)),
      hasAllPermissions: (permNames) =>
        permNames.every((p) => allPermissions.includes(p)),
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch user permissions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user-permissions/check
 * Check if user has specific permission(s)
 */
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { permissions, tenantId, requireAll = false } = body;

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json(
        { error: "permissions array is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where = { userId };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    // Get user's active permissions
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

    // Collect all active permissions
    const userPermissions = new Set();
    for (const userRole of userRoles) {
      if (!userRole.tenantRole.isActive) continue;
      for (const trp of userRole.tenantRole.tenantRolePermissions) {
        if (trp.permission.isActive && !trp.permission.isDeprecated) {
          userPermissions.add(trp.permission.name);
        }
      }
    }

    // Check requested permissions
    const results = permissions.map((perm) => ({
      permission: perm,
      granted: userPermissions.has(perm),
    }));

    const granted = requireAll
      ? results.every((r) => r.granted)
      : results.some((r) => r.granted);

    return NextResponse.json({
      granted,
      requireAll,
      results,
      userPermissionCount: userPermissions.size,
    });
  } catch (error) {
    console.error("Error checking user permissions:", error);
    return NextResponse.json(
      { error: "Failed to check user permissions" },
      { status: 500 }
    );
  }
}
