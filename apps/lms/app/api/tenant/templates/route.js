import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { requirePermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions.js";

/**
 * GET /api/tenant/templates
 * Get available role templates (for role initialization)
 * Requires: roles.create permission
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { tenantId: true },
    });

    if (!user?.tenantId) {
      return NextResponse.json({ error: "No tenant assigned" }, { status: 400 });
    }

    // Check permission
    const permResult = await requirePermission(PERMISSIONS.ROLES_CREATE, user.tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    // Get all role templates
    const templates = await prisma.roleTemplate.findMany({
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
      orderBy: [{ templateSetName: "asc" }, { slotPosition: "asc" }],
    });

    // Format templates
    const formattedTemplates = templates.map((t) => ({
      id: t.id,
      templateSetName: t.templateSetName,
      roleName: t.roleName,
      description: t.description,
      slotPosition: t.slotPosition,
      isDefaultSet: t.isDefaultSet,
      permissionCount: t.roleTemplatePermissions.length,
      permissions: t.roleTemplatePermissions.map((rtp) => rtp.permission),
    }));

    // Group by template set
    const groupedBySet = formattedTemplates.reduce((acc, t) => {
      if (!acc[t.templateSetName]) {
        acc[t.templateSetName] = {
          name: t.templateSetName,
          isDefault: t.isDefaultSet,
          roles: [],
        };
      }
      acc[t.templateSetName].roles.push(t);
      return acc;
    }, {});

    // Template set descriptions
    const setDescriptions = {
      generic: "Standard role set suitable for most organizations",
      education: "Role set for educational institutions",
      business: "Role set for corporate training and development",
      support: "Role set for customer support teams",
      saas: "Role set for SaaS product teams",
      healthcare: "Role set for healthcare training and compliance",
      retail: "Role set for retail operations",
    };

    // Format sets with descriptions
    const templateSets = Object.entries(groupedBySet).map(([key, set]) => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      description: setDescriptions[key] || "",
      isDefault: set.isDefault,
      roleCount: set.roles.length,
      roles: set.roles,
    }));

    return NextResponse.json({
      templateSets,
      templates: formattedTemplates,
      total: formattedTemplates.length,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
