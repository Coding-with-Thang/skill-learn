import { NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";

/**
 * GET /api/permissions/[permissionId]
 * Get a single permission by ID
 */
export async function GET(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { permissionId } = await params;

    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
      include: {
        replacementPermission: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        roleTemplatePermissions: {
          include: {
            roleTemplate: {
              select: {
                id: true,
                templateSetName: true,
                roleName: true,
              },
            },
          },
        },
        tenantRolePermissions: {
          include: {
            tenantRole: {
              select: {
                id: true,
                roleAlias: true,
                tenant: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!permission) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      permission: {
        id: permission.id,
        name: permission.name,
        displayName: permission.displayName,
        description: permission.description,
        category: permission.category,
        isActive: permission.isActive,
        isDeprecated: permission.isDeprecated,
        deprecatedAt: permission.deprecatedAt,
        sunsetDate: permission.sunsetDate,
        replacementPermission: permission.replacementPermission,
        createdAt: permission.createdAt,
        // Usage info
        roleTemplates: permission.roleTemplatePermissions.map((rtp) => ({
          id: rtp.roleTemplate.id,
          templateSetName: rtp.roleTemplate.templateSetName,
          roleName: rtp.roleTemplate.roleName,
        })),
        tenantRoles: permission.tenantRolePermissions.map((trp) => ({
          id: trp.tenantRole.id,
          roleAlias: trp.tenantRole.roleAlias,
          tenant: trp.tenantRole.tenant,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching permission:", error);
    return NextResponse.json(
      { error: "Failed to fetch permission" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/permissions/[permissionId]
 * Update a permission (super admin only)
 */
export async function PUT(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { permissionId } = await params;
    const body = await request.json();
    const {
      displayName,
      description,
      category,
      isActive,
      isDeprecated,
      replacementPermissionId,
      sunsetDate,
    } = body;

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!existingPermission) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      );
    }

    // If deprecating, validate replacement permission
    if (isDeprecated && replacementPermissionId) {
      const replacement = await prisma.permission.findUnique({
        where: { id: replacementPermissionId },
      });
      if (!replacement) {
        return NextResponse.json(
          { error: "Replacement permission not found" },
          { status: 400 }
        );
      }
      if (replacement.id === permissionId) {
        return NextResponse.json(
          { error: "Permission cannot replace itself" },
          { status: 400 }
        );
      }
    }

    // Update permission
    const permission = await prisma.permission.update({
      where: { id: permissionId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(isDeprecated !== undefined && {
          isDeprecated,
          deprecatedAt: isDeprecated ? new Date() : null,
        }),
        ...(replacementPermissionId !== undefined && {
          replacementPermissionId,
        }),
        ...(sunsetDate !== undefined && {
          sunsetDate: sunsetDate ? new Date(sunsetDate) : null,
        }),
      },
      include: {
        replacementPermission: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({ permission });
  } catch (error) {
    console.error("Error updating permission:", error);
    return NextResponse.json(
      { error: "Failed to update permission" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/permissions/[permissionId]
 * Delete a permission (super admin only)
 * Note: Prefer deprecating over deleting to maintain audit trail
 */
export async function DELETE(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { permissionId } = await params;

    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
      include: {
        _count: {
          select: {
            roleTemplatePermissions: true,
            tenantRolePermissions: true,
          },
        },
      },
    });

    if (!permission) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      );
    }

    // Warn if permission is in use
    const usageCount =
      permission._count.roleTemplatePermissions +
      permission._count.tenantRolePermissions;
    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete permission that is in use by ${usageCount} role(s). Consider deprecating instead.`,
          usageCount,
          suggestion:
            "Use PUT to set isDeprecated=true and optionally set a replacement permission",
        },
        { status: 400 }
      );
    }

    // Delete permission
    await prisma.permission.delete({
      where: { id: permissionId },
    });

    return NextResponse.json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting permission:", error);
    return NextResponse.json(
      { error: "Failed to delete permission" },
      { status: 500 }
    );
  }
}
