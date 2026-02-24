import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { requirePermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions";
import { logSecurityEvent } from "@skill-learn/lib/utils/security/logger";
import { SECURITY_EVENT_CATEGORIES, SECURITY_EVENT_TYPES } from "@skill-learn/lib/utils/security/eventTypes";
import { syncTenantUsersMetadata } from "@skill-learn/lib/utils/clerkSync";
import type { RouteContext } from "@/types";

const MAX_TX_RETRIES = 3;
const TX_RETRY_DELAY_MS = 100;

type RoleIdParams = { roleId: string };

function isRetryablePrismaError(e: unknown) {
  return (e as { code?: string })?.code === "P2034" || (e as { code?: string })?.code === "P2024";
}

/**
 * GET /api/tenant/roles/[roleId]
 * Get a single role
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<RoleIdParams>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
    }
    const { roleId } = await params;
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, tenantId: true },
    });
    if (!user?.tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, { status: 400 });
    }
    const permResult = await requirePermission(PERMISSIONS.ROLES_READ, user.tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }
    const role = await prisma.tenantRole.findFirst({
      where: { id: roleId, tenantId: user.tenantId },
      include: {
        createdFromTemplate: {
          select: { id: true, templateSetName: true, roleName: true },
        },
        tenantRolePermissions: {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
                displayName: true,
                description: true,
                category: true,
                isActive: true,
              },
            },
          },
        },
        _count: { select: { userRoles: true } },
      },
    });

    if (!role) {
      throw new AppError("Role not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    // Group permissions by category
    const permissionsByCategory = role.tenantRolePermissions.reduce((acc, trp) => {
      const cat = trp.permission.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(trp.permission);
      return acc;
    }, {});

    return NextResponse.json({
      role: {
        id: role.id,
        roleAlias: role.roleAlias,
        description: role.description,
        slotPosition: role.slotPosition,
        isActive: role.isActive,
        createdFromTemplate: role.createdFromTemplate,
        permissions: role.tenantRolePermissions.map((trp) => trp.permission),
        permissionsByCategory,
        userCount: role._count.userRoles,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/tenant/roles/[roleId]
 * Update a role
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext<RoleIdParams>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
    }
    const { roleId } = await params;
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { tenantId: true },
    });
    if (!user?.tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, { status: 400 });
    }
    const permResult = await requirePermission(PERMISSIONS.ROLES_UPDATE, user.tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    const body = await request.json();
    const { roleAlias, description, slotPosition, isActive, permissionIds } = body;

    // Verify role belongs to tenant
    const existingRole = await prisma.tenantRole.findFirst({
      where: { id: roleId, tenantId: user.tenantId },
    });

    if (!existingRole) {
      throw new AppError("Role not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    if (roleAlias && roleAlias !== existingRole.roleAlias) {
      const duplicate = await prisma.tenantRole.findFirst({
        where: { tenantId: user.tenantId, roleAlias, id: { not: roleId } },
      });
      if (duplicate) {
        throw new AppError(`A role with name "${roleAlias}" already exists`, ErrorType.VALIDATION, { status: 400 });
      }
    }

    // Update in transaction with retry (avoids P2034 when ClerkSync runs concurrently)
    let role;
    let lastError;
    for (let attempt = 0; attempt < MAX_TX_RETRIES; attempt++) {
      try {
        role = await prisma.$transaction(async (tx) => {
          await tx.tenantRole.update({
            where: { id: roleId },
            data: {
              ...(roleAlias !== undefined && { roleAlias }),
              ...(description !== undefined && { description }),
              ...(slotPosition !== undefined && { slotPosition }),
              ...(isActive !== undefined && { isActive }),
            },
          });

          if (permissionIds !== undefined) {
            await tx.tenantRolePermission.deleteMany({
              where: { tenantRoleId: roleId },
            });

            if (permissionIds.length > 0) {
              await tx.tenantRolePermission.createMany({
                data: permissionIds.map((permId) => ({
                  tenantRoleId: roleId,
                  permissionId: permId,
                })),
              });
            }
          }

          return tx.tenantRole.findUnique({
            where: { id: roleId },
            include: {
              tenantRolePermissions: {
                include: {
                  permission: {
                    select: { id: true, name: true, displayName: true, category: true },
                  },
                },
              },
              _count: { select: { userRoles: true } },
            },
          });
        });
        break;
      } catch (e) {
        lastError = e;
        if (attempt < MAX_TX_RETRIES - 1 && isRetryablePrismaError(e)) {
          await new Promise((r) => setTimeout(r, TX_RETRY_DELAY_MS * (attempt + 1)));
          continue;
        }
        throw e;
      }
    }

    // Sync users with this role to Clerk
    if (permissionIds !== undefined) {
      try {
        await syncTenantUsersMetadata(user.tenantId, roleId);
      } catch (err) {
        console.error("Failed to sync users:", err);
      }
    }

    await logSecurityEvent({
      actorUserId: user.id,
      actorClerkId: userId,
      tenantId: user.tenantId,
      eventType: SECURITY_EVENT_TYPES.RBAC_ROLE_UPDATED,
      category: SECURITY_EVENT_CATEGORIES.RBAC,
      action: "update",
      resource: "tenant_role",
      resourceId: roleId,
      severity: "high",
      message: `Updated role: ${role?.roleAlias || existingRole.roleAlias}`,
      details: {
        roleId,
        previousRoleAlias: existingRole.roleAlias,
        updatedRoleAlias: role?.roleAlias || existingRole.roleAlias,
        updatedFields: {
          roleAlias: roleAlias !== undefined,
          description: description !== undefined,
          slotPosition: slotPosition !== undefined,
          isActive: isActive !== undefined,
          permissions: permissionIds !== undefined,
        },
        permissionCount: role?.tenantRolePermissions.length || 0,
      },
      request,
    });

    return NextResponse.json({
      role: {
        id: role.id,
        roleAlias: role.roleAlias,
        description: role.description,
        slotPosition: role.slotPosition,
        isActive: role.isActive,
        permissions: role.tenantRolePermissions.map((trp) => trp.permission),
        userCount: role._count.userRoles,
        updatedAt: role.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/tenant/roles/[roleId]
 * Delete a role
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<RoleIdParams>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
    }
    const { roleId } = await params;
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, tenantId: true },
    });
    if (!user?.tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, { status: 400 });
    }
    const permResult = await requirePermission(PERMISSIONS.ROLES_DELETE, user.tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    // Verify role and check usage
    const role = await prisma.tenantRole.findFirst({
      where: { id: roleId, tenantId: user.tenantId },
      include: { _count: { select: { userRoles: true } } },
    });

    if (!role) {
      throw new AppError("Role not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    if (role._count.userRoles > 0) {
      throw new AppError(`Cannot delete role with ${role._count.userRoles} user(s). Remove users first.`, ErrorType.VALIDATION, { status: 400 });
    }

    // Delete role (cascade removes permissions)
    await prisma.tenantRole.delete({
      where: { id: roleId },
    });

    await logSecurityEvent({
      actorUserId: user.id,
      actorClerkId: userId,
      tenantId: user.tenantId,
      eventType: SECURITY_EVENT_TYPES.RBAC_ROLE_DELETED,
      category: SECURITY_EVENT_CATEGORIES.RBAC,
      action: "delete",
      resource: "tenant_role",
      resourceId: roleId,
      severity: "high",
      message: `Deleted role: ${role.roleAlias}`,
      details: {
        roleId,
        roleAlias: role.roleAlias,
        slotPosition: role.slotPosition,
      },
      request: _request,
    });

    return NextResponse.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
