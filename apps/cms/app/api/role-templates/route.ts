import { NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";
import { GUEST_ROLE_ALIAS } from "@skill-learn/lib/utils/tenantDefaultRole";

/**
 * GET /api/role-templates
 * Get all role templates (optionally filtered by template set)
 */
export async function GET(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { searchParams } = new URL(request.url);
    const templateSetName = searchParams.get("templateSetName");
    const isDefaultSet = searchParams.get("isDefaultSet");

    // Build where clause
    const where = {};
    if (templateSetName) {
      where.templateSetName = templateSetName;
    }
    if (isDefaultSet !== null) {
      where.isDefaultSet = isDefaultSet === "true";
    }

    const allRoleTemplates = await prisma.roleTemplate.findMany({
      where,
      include: {
        roleTemplatePermissions: {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
                displayName: true,
                category: true,
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: {
            tenantRoles: true,
          },
        },
      },
      orderBy: [{ templateSetName: "asc" }, { slotPosition: "asc" }],
    });
    // Exclude Guest - built-in default for all tenants, not counted toward role slots
    const roleTemplates = allRoleTemplates.filter(
      (t) => t.roleName?.toLowerCase() !== GUEST_ROLE_ALIAS.toLowerCase()
    );

    // Format response
    const formattedTemplates = roleTemplates.map((template) => ({
      id: template.id,
      templateSetName: template.templateSetName,
      roleName: template.roleName,
      description: template.description,
      slotPosition: template.slotPosition,
      isDefaultSet: template.isDefaultSet,
      createdAt: template.createdAt,
      permissions: template.roleTemplatePermissions.map(
        (rtp) => rtp.permission
      ),
      permissionCount: template.roleTemplatePermissions.length,
      tenantRolesUsingThisTemplate: template._count.tenantRoles,
    }));

    // Group by template set
    const groupedBySet = formattedTemplates.reduce((acc, template) => {
      if (!acc[template.templateSetName]) {
        acc[template.templateSetName] = [];
      }
      acc[template.templateSetName].push(template);
      return acc;
    }, {});

    // Get unique template set names
    const templateSets = [
      ...new Set(roleTemplates.map((t) => t.templateSetName)),
    ].sort();

    return NextResponse.json({
      roleTemplates: formattedTemplates,
      groupedBySet,
      templateSets,
      total: formattedTemplates.length,
    });
  } catch (error) {
    console.error("Error fetching role templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch role templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/role-templates
 * Create a new role template (super admin only)
 */
export async function POST(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await request.json();
    const {
      templateSetName,
      roleName,
      description,
      slotPosition,
      isDefaultSet,
      permissionIds,
    } = body;

    // Validate required fields
    if (!templateSetName || !roleName || slotPosition === undefined) {
      return NextResponse.json(
        { error: "templateSetName, roleName, and slotPosition are required" },
        { status: 400 }
      );
    }

    // Validate slot position (1-5)
    if (slotPosition < 1 || slotPosition > 10) {
      return NextResponse.json(
        { error: "slotPosition must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Check if template with same name exists in the set
    const existingTemplate = await prisma.roleTemplate.findFirst({
      where: {
        templateSetName,
        roleName,
      },
    });

    if (existingTemplate) {
      return NextResponse.json(
        {
          error: `A role template with name "${roleName}" already exists in set "${templateSetName}"`,
        },
        { status: 400 }
      );
    }

    // If setting as default, check if another default set exists
    if (isDefaultSet) {
      const existingDefault = await prisma.roleTemplate.findFirst({
        where: {
          isDefaultSet: true,
          templateSetName: { not: templateSetName },
        },
      });

      if (existingDefault) {
        return NextResponse.json(
          {
            error: `Template set "${existingDefault.templateSetName}" is already marked as default. Unmark it first.`,
          },
          { status: 400 }
        );
      }
    }

    // Validate permission IDs if provided
    if (permissionIds && permissionIds.length > 0) {
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

    // Create role template with permissions in a transaction
    const roleTemplate = await prisma.$transaction(async (tx) => {
      // Create the template
      const template = await tx.roleTemplate.create({
        data: {
          templateSetName,
          roleName,
          description: description || null,
          slotPosition,
          isDefaultSet: isDefaultSet || false,
        },
      });

      // Add permissions if provided
      if (permissionIds && permissionIds.length > 0) {
        await tx.roleTemplatePermission.createMany({
          data: permissionIds.map((permId) => ({
            roleTemplateId: template.id,
            permissionId: permId,
          })),
        });
      }

      // Fetch the complete template with permissions
      return tx.roleTemplate.findUnique({
        where: { id: template.id },
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

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating role template:", error);
    return NextResponse.json(
      { error: "Failed to create role template" },
      { status: 500 }
    );
  }
}
