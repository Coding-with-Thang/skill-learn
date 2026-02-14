import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { auth } from "@clerk/nextjs/server";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";

/**
 * GET /api/user-permissions
 * Get current user's permissions across all their tenant roles
 * Used by permissionsStore and frontend for permission checks
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    const where: { userId: string; tenantId?: string } = { userId };
    if (tenantId) {
      where.tenantId = tenantId;
    }

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

    type TenantGroup = {
      tenant: (typeof userRoles)[number]["tenant"];
      roles: Array<{ id: string; roleAlias: string; assignedAt: Date }>;
      permissions: Set<string>;
    };
    const permissionMap = new Map<string, { id: string; name: string; displayName: string; category: string }>();
    const rolesByTenant: Record<string, TenantGroup> = {};

    for (const userRole of userRoles) {
      if (!userRole.tenantRole.isActive) continue;

      const tenantKey = userRole.tenant.id;
      if (!rolesByTenant[tenantKey]) {
        rolesByTenant[tenantKey] = {
          tenant: userRole.tenant,
          roles: [],
          permissions: new Set<string>(),
        };
      }

      rolesByTenant[tenantKey]!.roles.push({
        id: userRole.tenantRole.id,
        roleAlias: userRole.tenantRole.roleAlias,
        assignedAt: userRole.assignedAt,
      });

      for (const trp of userRole.tenantRole.tenantRolePermissions) {
        const perm = trp.permission;
        if (perm.isActive && !perm.isDeprecated) {
          rolesByTenant[tenantKey]!.permissions.add(perm.name);
          permissionMap.set(perm.name, {
            id: perm.id,
            name: perm.name,
            displayName: perm.displayName,
            category: perm.category,
          });
        }
      }
    }

    const tenantPermissions = Object.values(rolesByTenant).map((tp) => ({
      tenant: tp.tenant,
      roles: tp.roles,
      permissions: Array.from(tp.permissions),
    }));

    const allPermissions = Array.from(permissionMap.keys());
    const permissionDetails = Array.from(permissionMap.values());
    const permissionsByCategory = permissionDetails.reduce((acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm.name);
      return acc;
    }, {});

    return NextResponse.json({
      userId,
      tenantPermissions,
      allPermissions,
      permissionsByCategory,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
