import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { requirePermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions.js";
import { syncTenantUsersMetadata } from "@skill-learn/lib/utils/clerkSync.js";

/**
 * GET /api/tenant/roles/[roleId]
 * Get a single role
 */
export async function GET(request, { params }) {
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
export async function PUT(request, { params }) {
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

    // Update in transaction
    const role = await prisma.$transaction(async (tx) => {
      await tx.tenantRole.update({
        where: { id: roleId },
        data: {
          ...(roleAlias !== undefined && { roleAlias }),
          ...(description !== undefined && { description }),
          ...(slotPosition !== undefined && { slotPosition }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      // Update permissions if provided
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

    // Sync users with this role to Clerk
    if (permissionIds !== undefined) {
      try {
        await syncTenantUsersMetadata(user.tenantId, roleId);
      } catch (err) {
        console.error("Failed to sync users:", err);
      }
    }

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
export async function DELETE(request, { params }) {
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

    return NextResponse.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
