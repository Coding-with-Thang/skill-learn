import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import {
  requirePermission,
  requireAnyPermission,
  PERMISSIONS,
} from "@skill-learn/lib/utils/permissions";
import { logSecurityEvent } from "@skill-learn/lib/utils/security/logger";
import { SECURITY_EVENT_CATEGORIES, SECURITY_EVENT_TYPES } from "@skill-learn/lib/utils/security/eventTypes";
import { syncTenantUsersMetadata } from "@skill-learn/lib/utils/clerkSync";
import { GUEST_ROLE_ALIAS } from "@skill-learn/lib/utils/tenantDefaultRole";

/**
 * GET /api/tenant/roles
 * Get all roles for the current user's tenant
 * Requires: roles.read permission
 */
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
    }
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

    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { id: true, name: true, maxRoleSlots: true },
    });
    if (!tenant) {
      throw new AppError("Tenant not found", ErrorType.NOT_FOUND, { status: 404 });
    }

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

    const rolesCountingTowardLimit = roles.filter((r) => !r.doesNotCountTowardSlotLimit);
    const usedSlots = rolesCountingTowardLimit.length;
    const availableSlots = Math.max(0, tenant.maxRoleSlots - usedSlots);

    const formattedRoles = roles.map((role) => ({
      id: role.id,
      roleAlias: role.roleAlias,
      description: role.description,
      slotPosition: role.slotPosition,
      isActive: role.isActive,
      doesNotCountTowardSlotLimit: role.doesNotCountTowardSlotLimit,
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
      usedSlots,
      availableSlots,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/tenant/roles
 * Create a new role for the tenant
 * Requires: roles.create permission
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { tenantId: true },
    });
    if (!user?.tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, { status: 400 });
    }
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
    if (!tenant) {
      throw new AppError("Tenant not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const existingRolesCount = await prisma.tenantRole.count({
      where: { tenantId: user.tenantId, doesNotCountTowardSlotLimit: false },
    });

    if (existingRolesCount >= tenant.maxRoleSlots) {
      throw new AppError(`Maximum ${tenant.maxRoleSlots} roles reached. Upgrade your plan for more.`, ErrorType.VALIDATION, { status: 400 });
    }
    if (!roleAlias) {
      throw new AppError("Role name is required", ErrorType.VALIDATION, { status: 400 });
    }
    const existingRole = await prisma.tenantRole.findFirst({
      where: { tenantId: user.tenantId, roleAlias },
    });
    if (existingRole) {
      throw new AppError(`A role with name "${roleAlias}" already exists`, ErrorType.VALIDATION, { status: 400 });
    }

    // Get template permissions if using template
    let templatePermissionIds: string[] = [];
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
          tenantId: user.tenantId!,
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

    if (!role) {
      throw new AppError("Failed to create role", ErrorType.INTERNAL, { status: 500 });
    }

    await logSecurityEvent({
      actorUserId: user.id,
      actorClerkId: userId,
      tenantId: user.tenantId,
      eventType: SECURITY_EVENT_TYPES.RBAC_ROLE_CREATED,
      category: SECURITY_EVENT_CATEGORIES.RBAC,
      action: "create",
      resource: "tenant_role",
      resourceId: role.id,
      severity: "high",
      message: `Created role: ${role.roleAlias}`,
      details: {
        roleAlias: role.roleAlias,
        slotPosition: role.slotPosition,
        permissionCount: role.tenantRolePermissions.length,
        createdFromTemplateId: templateId || null,
      },
      request,
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
    return handleApiError(error);
  }
}

/**
 * PUT /api/tenant/roles
 * Initialize roles from a template set
 * Requires: roles.create permission
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, tenantId: true },
    });
    if (!user?.tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, { status: 400 });
    }
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
    if (!tenant) {
      throw new AppError("Tenant not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    // Check if tenant already has roles
    if (tenant._count.tenantRoles > 0) {
      throw new AppError("Tenant already has roles. Delete existing roles first or add roles individually.", ErrorType.VALIDATION, { status: 400 });
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
      throw new AppError(`No templates found for set "${templateSetName}"`, ErrorType.NOT_FOUND, { status: 404 });
    }

    // Create roles
    const createdRoles = await prisma.$transaction(async (tx) => {
      const roles: Array<{ id: string; roleAlias: string; slotPosition: number; permissionCount: number }> = [];

      for (const template of templates) {
        if (template.roleName?.toLowerCase() === GUEST_ROLE_ALIAS.toLowerCase()) continue;
        if (template.slotPosition > tenant.maxRoleSlots) continue;

        const role = await tx.tenantRole.create({
          data: {
            tenantId: user.tenantId!,
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

    await logSecurityEvent({
      actorUserId: user.id,
      actorClerkId: userId,
      tenantId: user.tenantId,
      eventType: SECURITY_EVENT_TYPES.RBAC_ROLE_TEMPLATE_INITIALIZED,
      category: SECURITY_EVENT_CATEGORIES.RBAC,
      action: "create",
      resource: "tenant_role_template_set",
      severity: "high",
      message: `Initialized roles from template set: ${templateSetName}`,
      details: {
        templateSetName,
        createdRoleCount: createdRoles.length,
        createdRoles,
      },
      request,
    });

    return NextResponse.json({
      success: true,
      message: `Initialized ${createdRoles.length} roles from "${templateSetName}" template`,
      roles: createdRoles,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
