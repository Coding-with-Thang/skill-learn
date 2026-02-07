import { NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

/**
 * GET /api/tenants/[tenantId]/roles
 * Get all roles for a tenant
 */
export async function GET(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, maxRoleSlots: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const roles = await prisma.tenantRole.findMany({
      where: { tenantId },
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

    // Load template permission IDs for roles created from a template (to compute modifiedFromTemplate)
    const templateIds = [...new Set(roles.map((r) => r.createdFromTemplateId).filter(Boolean))];
    const templatePermissions = await prisma.roleTemplatePermission.findMany({
      where: { roleTemplateId: { in: templateIds } },
      select: { roleTemplateId: true, permissionId: true },
    });
    const templatePermIdsByTemplateId = new Map();
    for (const tp of templatePermissions) {
      if (!templatePermIdsByTemplateId.has(tp.roleTemplateId)) {
        templatePermIdsByTemplateId.set(tp.roleTemplateId, new Set());
      }
      templatePermIdsByTemplateId.get(tp.roleTemplateId).add(tp.permissionId);
    }

    const formattedRoles = roles.map((role) => {
      const rolePermIds = new Set(role.tenantRolePermissions.map((trp) => trp.permissionId));
      const templatePermIds = role.createdFromTemplateId
        ? templatePermIdsByTemplateId.get(role.createdFromTemplateId)
        : null;
      const nameMatchesTemplate =
        role.createdFromTemplate?.roleName != null &&
        role.roleAlias === role.createdFromTemplate.roleName;
      const permsMatchTemplate =
        templatePermIds != null &&
        rolePermIds.size === templatePermIds.size &&
        [...rolePermIds].every((id) => templatePermIds.has(id));
      const modifiedFromTemplate =
        !role.createdFromTemplate
          ? true
          : !nameMatchesTemplate || !permsMatchTemplate;

      return {
        id: role.id,
        roleAlias: role.roleAlias,
        description: role.description,
        slotPosition: role.slotPosition,
        isActive: role.isActive,
        createdFromTemplate: role.createdFromTemplate,
        modifiedFromTemplate,
        permissions: role.tenantRolePermissions.map((trp) => trp.permission),
        permissionCount: role.tenantRolePermissions.length,
        userCount: role._count.userRoles,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    });

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
    console.error("Error fetching tenant roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant roles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants/[tenantId]/roles
 * Create a new role for a tenant (from template or custom)
 */
export async function POST(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;
    const body = await request.json();
    const { roleAlias, description, slotPosition, templateId, permissionIds } =
      body;

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, maxRoleSlots: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check slot limits
    const existingRolesCount = await prisma.tenantRole.count({
      where: { tenantId },
    });

    if (existingRolesCount >= tenant.maxRoleSlots) {
      return NextResponse.json(
        {
          error: `Tenant has reached the maximum of ${tenant.maxRoleSlots} roles. Purchase additional role slots or upgrade subscription.`,
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!roleAlias) {
      return NextResponse.json(
        { error: "roleAlias is required" },
        { status: 400 }
      );
    }

    // Check for duplicate role alias in tenant
    const existingRole = await prisma.tenantRole.findFirst({
      where: {
        tenantId,
        roleAlias,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        {
          error: `A role with name "${roleAlias}" already exists in this tenant`,
        },
        { status: 400 }
      );
    }

    // Determine slot position
    let finalSlotPosition = slotPosition;
    if (!finalSlotPosition) {
      // Find next available slot
      const usedSlots = await prisma.tenantRole.findMany({
        where: { tenantId },
        select: { slotPosition: true },
      });
      const usedSlotSet = new Set(usedSlots.map((r) => r.slotPosition));
      for (let i = 1; i <= tenant.maxRoleSlots; i++) {
        if (!usedSlotSet.has(i)) {
          finalSlotPosition = i;
          break;
        }
      }
    }

    // If creating from template, get template permissions
    let templatePermissionIds = [];
    let templateData = null;
    if (templateId) {
      const template = await prisma.roleTemplate.findUnique({
        where: { id: templateId },
        include: {
          roleTemplatePermissions: {
            select: { permissionId: true },
          },
        },
      });

      if (!template) {
        return NextResponse.json(
          { error: "Role template not found" },
          { status: 404 }
        );
      }

      templatePermissionIds = template.roleTemplatePermissions.map(
        (rtp) => rtp.permissionId
      );
      templateData = {
        id: template.id,
        templateSetName: template.templateSetName,
        roleName: template.roleName,
      };
    }

    // Determine final permissions
    const finalPermissionIds =
      permissionIds && permissionIds.length > 0
        ? permissionIds
        : templatePermissionIds;

    // Validate permission IDs
    if (finalPermissionIds.length > 0) {
      const validPermissions = await prisma.permission.findMany({
        where: { id: { in: finalPermissionIds } },
        select: { id: true },
      });

      if (validPermissions.length !== finalPermissionIds.length) {
        return NextResponse.json(
          { error: "One or more permission IDs are invalid" },
          { status: 400 }
        );
      }
    }

    // Create role with permissions in a transaction
    const tenantRole = await prisma.$transaction(async (tx) => {
      // Create the role
      const role = await tx.tenantRole.create({
        data: {
          tenantId,
          roleAlias,
          description: description || null,
          slotPosition: finalSlotPosition,
          isActive: true,
          createdFromTemplateId: templateId || null,
        },
      });

      // Add permissions
      if (finalPermissionIds.length > 0) {
        await tx.tenantRolePermission.createMany({
          data: finalPermissionIds.map((permId) => ({
            tenantRoleId: role.id,
            permissionId: permId,
          })),
        });
      }

      // Fetch complete role with permissions
      return tx.tenantRole.findUnique({
        where: { id: role.id },
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
        },
      });
    });

    return NextResponse.json(
      {
        tenantRole: {
          id: tenantRole.id,
          roleAlias: tenantRole.roleAlias,
          description: tenantRole.description,
          slotPosition: tenantRole.slotPosition,
          isActive: tenantRole.isActive,
          createdFromTemplate: tenantRole.createdFromTemplate,
          permissions: tenantRole.tenantRolePermissions.map(
            (trp) => trp.permission
          ),
          createdAt: tenantRole.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tenant role:", error);
    return NextResponse.json(
      { error: "Failed to create tenant role" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants/[tenantId]/roles/initialize
 * Initialize default roles from a template set
 */
export async function PUT(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;
    const body = await request.json();
    const { templateSetName = "generic" } = body;

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: { select: { tenantRoles: true } },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check if tenant already has roles
    if (tenant._count.tenantRoles > 0) {
      return NextResponse.json(
        {
          error: "Tenant already has roles. Use POST to add individual roles.",
          existingRoles: tenant._count.tenantRoles,
        },
        { status: 400 }
      );
    }

    // Get template set
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

    // Create roles from templates in a transaction
    const createdRoles = await prisma.$transaction(async (tx) => {
      const roles = [];

      for (const template of templates) {
        // Skip if would exceed max slots
        if (template.slotPosition > tenant.maxRoleSlots) {
          continue;
        }

        // Create role
        const role = await tx.tenantRole.create({
          data: {
            tenantId,
            roleAlias: template.roleName,
            description: template.description,
            slotPosition: template.slotPosition,
            isActive: true,
            createdFromTemplateId: template.id,
          },
        });

        // Add permissions from template
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
      message: `Initialized ${createdRoles.length} roles from "${templateSetName}" template set`,
      roles: createdRoles,
    });
  } catch (error) {
    console.error("Error initializing tenant roles:", error);
    return NextResponse.json(
      { error: "Failed to initialize tenant roles" },
      { status: 500 }
    );
  }
}
