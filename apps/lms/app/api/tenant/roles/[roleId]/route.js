import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await params;

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant assigned" }, { status: 400 });
    }

    // Check permission
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
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
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
    console.error("Error fetching role:", error);
    return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await params;

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant assigned" }, { status: 400 });
    }

    // Check permission
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
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Check for duplicate name
    if (roleAlias && roleAlias !== existingRole.roleAlias) {
      const duplicate = await prisma.tenantRole.findFirst({
        where: { tenantId: user.tenantId, roleAlias, id: { not: roleId } },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `A role with name "${roleAlias}" already exists` },
          { status: 400 }
        );
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
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleId } = await params;

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant assigned" }, { status: 400 });
    }

    // Check permission
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
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (role._count.userRoles > 0) {
      return NextResponse.json(
        { error: `Cannot delete role with ${role._count.userRoles} user(s). Remove users first.` },
        { status: 400 }
      );
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
    console.error("Error deleting role:", error);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
