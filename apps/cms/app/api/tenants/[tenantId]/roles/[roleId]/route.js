import { NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

/**
 * GET /api/tenants/[tenantId]/roles/[roleId]
 * Get a single tenant role by ID
 */
export async function GET(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId, roleId } = await params;

    const role = await prisma.tenantRole.findFirst({
      where: {
        id: roleId,
        tenantId,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdFromTemplate: {
          select: {
            id: true,
            templateSetName: true,
            roleName: true,
          },
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
                isDeprecated: true,
              },
            },
          },
        },
        userRoles: {
          include: {
            tenant: {
              select: { name: true },
            },
          },
          take: 10,
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Tenant role not found" },
        { status: 404 }
      );
    }

    // Group permissions by category
    const permissionsByCategory = role.tenantRolePermissions.reduce(
      (acc, trp) => {
        const category = trp.permission.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(trp.permission);
        return acc;
      },
      {}
    );

    return NextResponse.json({
      role: {
        id: role.id,
        roleAlias: role.roleAlias,
        description: role.description,
        slotPosition: role.slotPosition,
        isActive: role.isActive,
        tenant: role.tenant,
        createdFromTemplate: role.createdFromTemplate,
        permissions: role.tenantRolePermissions.map((trp) => trp.permission),
        permissionsByCategory,
        userCount: role._count.userRoles,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching tenant role:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant role" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tenants/[tenantId]/roles/[roleId]
 * Update a tenant role
 */
export async function PUT(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId, roleId } = await params;
    const body = await request.json();
    const { roleAlias, description, slotPosition, isActive, permissionIds } =
      body;

    // Check if role exists and belongs to tenant
    const existingRole = await prisma.tenantRole.findFirst({
      where: {
        id: roleId,
        tenantId,
      },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Tenant role not found" },
        { status: 404 }
      );
    }

    // If changing role alias, check for duplicates
    if (roleAlias && roleAlias !== existingRole.roleAlias) {
      const duplicateName = await prisma.tenantRole.findFirst({
        where: {
          tenantId,
          roleAlias,
          id: { not: roleId },
        },
      });

      if (duplicateName) {
        return NextResponse.json(
          {
            error: `A role with name "${roleAlias}" already exists in this tenant`,
          },
          { status: 400 }
        );
      }
    }

    // Validate permission IDs if provided
    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        const validPermissions = await prisma.permission.findMany({
          where: { id: { in: permissionIds } },
          select: { id: true },
        });

        if (validPermissions.length !== permissionIds.length) {
          return NextResponse.json(
            { error: "One or more permission IDs are invalid" },
            { status: 400 }
          );
        }
      }
    }

    // Update in transaction
    const role = await prisma.$transaction(async (tx) => {
      // Update the role
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
        // Remove existing permissions
        await tx.tenantRolePermission.deleteMany({
          where: { tenantRoleId: roleId },
        });

        // Add new permissions
        if (permissionIds.length > 0) {
          await tx.tenantRolePermission.createMany({
            data: permissionIds.map((permId) => ({
              tenantRoleId: roleId,
              permissionId: permId,
            })),
          });
        }
      }

      // Fetch updated role
      return tx.tenantRole.findUnique({
        where: { id: roleId },
        include: {
          createdFromTemplate: {
            select: {
              id: true,
              templateSetName: true,
              roleName: true,
            },
          },
          tenantRolePermissions: {
            include: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  category: true,
                },
              },
            },
          },
          _count: {
            select: { userRoles: true },
          },
        },
      });
    });

    return NextResponse.json({
      role: {
        id: role.id,
        roleAlias: role.roleAlias,
        description: role.description,
        slotPosition: role.slotPosition,
        isActive: role.isActive,
        createdFromTemplate: role.createdFromTemplate,
        permissions: role.tenantRolePermissions.map((trp) => trp.permission),
        userCount: role._count.userRoles,
        updatedAt: role.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating tenant role:", error);
    return NextResponse.json(
      { error: "Failed to update tenant role" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tenants/[tenantId]/roles/[roleId]
 * Delete a tenant role
 */
export async function DELETE(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId, roleId } = await params;

    // Check if role exists and belongs to tenant
    const role = await prisma.tenantRole.findFirst({
      where: {
        id: roleId,
        tenantId,
      },
      include: {
        _count: {
          select: { userRoles: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Tenant role not found" },
        { status: 404 }
      );
    }

    // Check if any users have this role
    if (role._count.userRoles > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete role with ${role._count.userRoles} assigned user(s). Unassign users first or deactivate the role instead.`,
          userCount: role._count.userRoles,
        },
        { status: 400 }
      );
    }

    // Delete role (cascade will remove tenantRolePermissions)
    await prisma.tenantRole.delete({
      where: { id: roleId },
    });

    return NextResponse.json({
      success: true,
      message: "Tenant role deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tenant role:", error);
    return NextResponse.json(
      { error: "Failed to delete tenant role" },
      { status: 500 }
    );
  }
}
