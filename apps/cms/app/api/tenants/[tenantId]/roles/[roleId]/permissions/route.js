import { NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";
import { syncTenantUsersMetadata } from "@skill-learn/lib/utils/clerkSync.js";

/**
 * GET /api/tenants/[tenantId]/roles/[roleId]/permissions
 * Get all permissions assigned to a tenant role
 */
export async function GET(request, { params }) {
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
      select: { id: true, roleAlias: true },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Tenant role not found" },
        { status: 404 }
      );
    }

    const permissions = await prisma.tenantRolePermission.findMany({
      where: { tenantRoleId: roleId },
      include: {
        permission: true,
      },
      orderBy: {
        permission: {
          category: "asc",
        },
      },
    });

    // Group by category
    const groupedByCategory = permissions.reduce((acc, trp) => {
      const category = trp.permission.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: trp.permission.id,
        name: trp.permission.name,
        displayName: trp.permission.displayName,
        description: trp.permission.description,
        isActive: trp.permission.isActive,
        assignedAt: trp.assignedAt,
      });
      return acc;
    }, {});

    return NextResponse.json({
      role,
      permissions: permissions.map((trp) => ({
        id: trp.permission.id,
        name: trp.permission.name,
        displayName: trp.permission.displayName,
        description: trp.permission.description,
        category: trp.permission.category,
        isActive: trp.permission.isActive,
        assignedAt: trp.assignedAt,
      })),
      groupedByCategory,
      total: permissions.length,
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch role permissions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants/[tenantId]/roles/[roleId]/permissions
 * Add permissions to a tenant role
 */
export async function POST(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId, roleId } = await params;
    const body = await request.json();
    const { permissionIds } = body;

    // Validate input
    if (
      !permissionIds ||
      !Array.isArray(permissionIds) ||
      permissionIds.length === 0
    ) {
      return NextResponse.json(
        { error: "permissionIds array is required" },
        { status: 400 }
      );
    }

    // Check if role exists and belongs to tenant
    const role = await prisma.tenantRole.findFirst({
      where: {
        id: roleId,
        tenantId,
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Tenant role not found" },
        { status: 404 }
      );
    }

    // Validate all permission IDs
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

    // Get existing permissions for this role
    const existingPermissions = await prisma.tenantRolePermission.findMany({
      where: { tenantRoleId: roleId },
      select: { permissionId: true },
    });

    const existingPermissionIds = new Set(
      existingPermissions.map((p) => p.permissionId)
    );

    // Filter out already assigned permissions
    const newPermissionIds = permissionIds.filter(
      (id) => !existingPermissionIds.has(id)
    );

    if (newPermissionIds.length === 0) {
      return NextResponse.json(
        { error: "All specified permissions are already assigned" },
        { status: 400 }
      );
    }

    // Add new permissions
    await prisma.tenantRolePermission.createMany({
      data: newPermissionIds.map((permId) => ({
        tenantRoleId: roleId,
        permissionId: permId,
      })),
    });

    // Sync all users with this role to Clerk
    try {
      await syncTenantUsersMetadata(tenantId, roleId);
    } catch (syncError) {
      console.error("Failed to sync users metadata to Clerk:", syncError);
      // Don't fail the request, permissions were added successfully
    }

    // Fetch updated permissions
    const updatedPermissions = await prisma.tenantRolePermission.findMany({
      where: { tenantRoleId: roleId },
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
    });

    return NextResponse.json({
      success: true,
      addedCount: newPermissionIds.length,
      skippedCount: permissionIds.length - newPermissionIds.length,
      permissions: updatedPermissions.map((trp) => trp.permission),
    });
  } catch (error) {
    console.error("Error adding role permissions:", error);
    return NextResponse.json(
      { error: "Failed to add role permissions" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tenants/[tenantId]/roles/[roleId]/permissions
 * Remove permissions from a tenant role
 */
export async function DELETE(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId, roleId } = await params;
    const body = await request.json();
    const { permissionIds } = body;

    // Validate input
    if (
      !permissionIds ||
      !Array.isArray(permissionIds) ||
      permissionIds.length === 0
    ) {
      return NextResponse.json(
        { error: "permissionIds array is required" },
        { status: 400 }
      );
    }

    // Check if role exists and belongs to tenant
    const role = await prisma.tenantRole.findFirst({
      where: {
        id: roleId,
        tenantId,
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Tenant role not found" },
        { status: 404 }
      );
    }

    // Remove permissions
    const result = await prisma.tenantRolePermission.deleteMany({
      where: {
        tenantRoleId: roleId,
        permissionId: { in: permissionIds },
      },
    });

    // Sync all users with this role to Clerk
    try {
      await syncTenantUsersMetadata(tenantId, roleId);
    } catch (syncError) {
      console.error("Failed to sync users metadata to Clerk:", syncError);
      // Don't fail the request, permissions were removed successfully
    }

    // Fetch remaining permissions
    const remainingPermissions = await prisma.tenantRolePermission.findMany({
      where: { tenantRoleId: roleId },
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
    });

    return NextResponse.json({
      success: true,
      removedCount: result.count,
      remainingPermissions: remainingPermissions.map((trp) => trp.permission),
    });
  } catch (error) {
    console.error("Error removing role permissions:", error);
    return NextResponse.json(
      { error: "Failed to remove role permissions" },
      { status: 500 }
    );
  }
}
