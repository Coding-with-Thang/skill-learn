import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import {
  requirePermission,
  requireAnyPermission,
  PERMISSIONS,
} from "@skill-learn/lib/utils/permissions.js";
import { syncTenantUsersMetadata } from "@skill-learn/lib/utils/clerkSync.js";

/**
 * GET /api/tenant/roles
 * Get all roles for the current user's tenant
 * Requires: roles.read permission
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
    const permResult = await requirePermission(PERMISSIONS.ROLES_READ, user.tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { id: true, name: true, maxRoleSlots: true },
    });

    // Get roles
    const roles = await prisma.tenantRole.findMany({
      where: { tenantId: user.tenantId },
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
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: { slotPosition: "asc" },
    });

    const formattedRoles = roles.map((role) => ({
      id: role.id,
      roleAlias: role.roleAlias,
      description: role.description,
      slotPosition: role.slotPosition,
      isActive: role.isActive,
      createdFromTemplate: role.createdFromTemplate,
      permissions: role.tenantRolePermissions.map((trp) => trp.permission),
      permissionCount: role.tenantRolePermissions.length,
      userCount: role._count.userRoles,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        maxRoleSlots: tenant.maxRoleSlots,
      },
      roles: formattedRoles,
      usedSlots: formattedRoles.length,
      availableSlots: tenant.maxRoleSlots - formattedRoles.length,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenant/roles
 * Create a new role for the tenant
 * Requires: roles.create permission
 */
export async function POST(request) {
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

    const body = await request.json();
    const { roleAlias, description, slotPosition, templateId, permissionIds } = body;

    // Get tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { id: true, maxRoleSlots: true },
    });

    // Check slot limits
    const existingRolesCount = await prisma.tenantRole.count({
      where: { tenantId: user.tenantId },
    });

    if (existingRolesCount >= tenant.maxRoleSlots) {
      return NextResponse.json(
        { error: `Maximum ${tenant.maxRoleSlots} roles reached. Upgrade your plan for more.` },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!roleAlias) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existingRole = await prisma.tenantRole.findFirst({
      where: { tenantId: user.tenantId, roleAlias },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: `A role with name "${roleAlias}" already exists` },
        { status: 400 }
      );
    }

    // Get template permissions if using template
    let templatePermissionIds = [];
    if (templateId) {
      const template = await prisma.roleTemplate.findUnique({
        where: { id: templateId },
        include: {
          roleTemplatePermissions: {
            select: { permissionId: true },
          },
        },
      });
      if (template) {
        templatePermissionIds = template.roleTemplatePermissions.map((p) => p.permissionId);
      }
    }

    const finalPermissionIds = permissionIds?.length > 0 ? permissionIds : templatePermissionIds;

    // Create role with permissions
    const role = await prisma.$transaction(async (tx) => {
      const newRole = await tx.tenantRole.create({
        data: {
          tenantId: user.tenantId,
          roleAlias,
          description: description || null,
          slotPosition: slotPosition || existingRolesCount + 1,
          isActive: true,
          createdFromTemplateId: templateId || null,
        },
      });

      if (finalPermissionIds.length > 0) {
        await tx.tenantRolePermission.createMany({
          data: finalPermissionIds.map((permId) => ({
            tenantRoleId: newRole.id,
            permissionId: permId,
          })),
        });
      }

      return tx.tenantRole.findUnique({
        where: { id: newRole.id },
        include: {
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
        },
      });
    });

    return NextResponse.json(
      {
        role: {
          id: role.id,
          roleAlias: role.roleAlias,
          description: role.description,
          slotPosition: role.slotPosition,
          isActive: role.isActive,
          permissions: role.tenantRolePermissions.map((trp) => trp.permission),
          createdAt: role.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tenant/roles
 * Initialize roles from a template set
 * Requires: roles.create permission
 */
export async function PUT(request) {
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

    const body = await request.json();
    const { templateSetName = "generic" } = body;

    // Get tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      include: {
        _count: { select: { tenantRoles: true } },
      },
    });

    // Check if tenant already has roles
    if (tenant._count.tenantRoles > 0) {
      return NextResponse.json(
        { error: "Tenant already has roles. Delete existing roles first or add roles individually." },
        { status: 400 }
      );
    }

    // Get templates
    const templates = await prisma.roleTemplate.findMany({
      where: { templateSetName },
      include: {
        roleTemplatePermissions: {
          select: { permissionId: true },
        },
      },
      orderBy: { slotPosition: "asc" },
    });

    if (templates.length === 0) {
      return NextResponse.json(
        { error: `No templates found for set "${templateSetName}"` },
        { status: 404 }
      );
    }

    // Create roles
    const createdRoles = await prisma.$transaction(async (tx) => {
      const roles = [];

      for (const template of templates) {
        if (template.slotPosition > tenant.maxRoleSlots) continue;

        const role = await tx.tenantRole.create({
          data: {
            tenantId: user.tenantId,
            roleAlias: template.roleName,
            description: template.description,
            slotPosition: template.slotPosition,
            isActive: true,
            createdFromTemplateId: template.id,
          },
        });

        if (template.roleTemplatePermissions.length > 0) {
          await tx.tenantRolePermission.createMany({
            data: template.roleTemplatePermissions.map((rtp) => ({
              tenantRoleId: role.id,
              permissionId: rtp.permissionId,
            })),
          });
        }

        roles.push({
          id: role.id,
          roleAlias: role.roleAlias,
          slotPosition: role.slotPosition,
          permissionCount: template.roleTemplatePermissions.length,
        });
      }

      return roles;
    });

    return NextResponse.json({
      success: true,
      message: `Initialized ${createdRoles.length} roles from "${templateSetName}" template`,
      roles: createdRoles,
    });
  } catch (error) {
    console.error("Error initializing roles:", error);
    return NextResponse.json(
      { error: "Failed to initialize roles" },
      { status: 500 }
    );
  }
}
