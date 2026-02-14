import { NextRequest, NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";
import type { RouteContext } from "@/types";

type TemplateIdParams = { templateId: string };

/**
 * GET /api/role-templates/[templateId]
 * Get a single role template by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<TemplateIdParams>
) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { templateId } = await params;

    const roleTemplate = await prisma.roleTemplate.findUnique({
      where: { id: templateId },
      include: {
        roleTemplatePermissions: {
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
        tenantRoles: {
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
    });

    if (!roleTemplate) {
      return NextResponse.json(
        { error: "Role template not found" },
        { status: 404 }
      );
    }

    // Group permissions by category
    const permissionsByCategory = roleTemplate.roleTemplatePermissions.reduce(
      (acc, rtp) => {
        const category = rtp.permission.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(rtp.permission);
        return acc;
      },
      {}
    );

    return NextResponse.json({
      roleTemplate: {
        id: roleTemplate.id,
        templateSetName: roleTemplate.templateSetName,
        roleName: roleTemplate.roleName,
        description: roleTemplate.description,
        slotPosition: roleTemplate.slotPosition,
        isDefaultSet: roleTemplate.isDefaultSet,
        createdAt: roleTemplate.createdAt,
        permissions: roleTemplate.roleTemplatePermissions.map(
          (rtp) => rtp.permission
        ),
        permissionsByCategory,
        tenantRolesUsingThisTemplate: roleTemplate.tenantRoles,
      },
    });
  } catch (error) {
    console.error("Error fetching role template:", error);
    return NextResponse.json(
      { error: "Failed to fetch role template" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/role-templates/[templateId]
 * Update a role template (super admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext<TemplateIdParams>
) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { templateId } = await params;
    const body = await request.json();
    const {
      roleName,
      description,
      slotPosition,
      isDefaultSet,
      permissionIds,
    } = body;

    // Check if template exists
    const existingTemplate = await prisma.roleTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Role template not found" },
        { status: 404 }
      );
    }

    // If changing role name, check for duplicates
    if (roleName && roleName !== existingTemplate.roleName) {
      const duplicateName = await prisma.roleTemplate.findFirst({
        where: {
          templateSetName: existingTemplate.templateSetName,
          roleName,
          id: { not: templateId },
        },
      });

      if (duplicateName) {
        return NextResponse.json(
          {
            error: `A role template with name "${roleName}" already exists in this set`,
          },
          { status: 400 }
        );
      }
    }

    // Validate slot position if provided
    if (slotPosition !== undefined && (slotPosition < 1 || slotPosition > 10)) {
      return NextResponse.json(
        { error: "slotPosition must be between 1 and 10" },
        { status: 400 }
      );
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
    const roleTemplate = await prisma.$transaction(async (tx) => {
      // Update the template
      await tx.roleTemplate.update({
        where: { id: templateId },
        data: {
          ...(roleName !== undefined && { roleName }),
          ...(description !== undefined && { description }),
          ...(slotPosition !== undefined && { slotPosition }),
          ...(isDefaultSet !== undefined && { isDefaultSet }),
        },
      });

      // Update permissions if provided
      if (permissionIds !== undefined) {
        // Remove existing permissions
        await tx.roleTemplatePermission.deleteMany({
          where: { roleTemplateId: templateId },
        });

        // Add new permissions
        if (permissionIds.length > 0) {
          await tx.roleTemplatePermission.createMany({
            data: permissionIds.map((permId) => ({
              roleTemplateId: templateId,
              permissionId: permId,
            })),
          });
        }
      }

      // Fetch updated template
      return tx.roleTemplate.findUnique({
        where: { id: templateId },
        include: {
          roleTemplatePermissions: {
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
        },
      });
    });

    return NextResponse.json({
      roleTemplate: {
        id: roleTemplate.id,
        templateSetName: roleTemplate.templateSetName,
        roleName: roleTemplate.roleName,
        description: roleTemplate.description,
        slotPosition: roleTemplate.slotPosition,
        isDefaultSet: roleTemplate.isDefaultSet,
        createdAt: roleTemplate.createdAt,
        permissions: roleTemplate.roleTemplatePermissions.map(
          (rtp) => rtp.permission
        ),
      },
    });
  } catch (error) {
    console.error("Error updating role template:", error);
    return NextResponse.json(
      { error: "Failed to update role template" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/role-templates/[templateId]
 * Delete a role template (super admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<TemplateIdParams>
) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { templateId } = await params;

    // Check if template exists
    const template = await prisma.roleTemplate.findUnique({
      where: { id: templateId },
      include: {
        _count: {
          select: {
            tenantRoles: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Role template not found" },
        { status: 404 }
      );
    }

    // Check if any tenant roles are using this template
    if (template._count.tenantRoles > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete template used by ${template._count.tenantRoles} tenant role(s)`,
          usageCount: template._count.tenantRoles,
        },
        { status: 400 }
      );
    }

    // Delete template (cascade will remove roleTemplatePermissions)
    await prisma.roleTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({
      success: true,
      message: "Role template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting role template:", error);
    return NextResponse.json(
      { error: "Failed to delete role template" },
      { status: 500 }
    );
  }
}
