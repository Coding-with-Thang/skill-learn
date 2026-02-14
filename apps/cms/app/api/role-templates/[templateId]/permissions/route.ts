import { NextRequest, NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";
import type { RouteContext } from "@/types";

type TemplateIdParams = { templateId: string };

/**
 * GET /api/role-templates/[templateId]/permissions
 * Get all permissions assigned to a role template
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

    // Check if template exists
    const template = await prisma.roleTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, roleName: true, templateSetName: true },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Role template not found" },
        { status: 404 }
      );
    }

    const permissions = await prisma.roleTemplatePermission.findMany({
      where: { roleTemplateId: templateId },
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
    const groupedByCategory = permissions.reduce((acc, rtp) => {
      const category = rtp.permission.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: rtp.permission.id,
        name: rtp.permission.name,
        displayName: rtp.permission.displayName,
        description: rtp.permission.description,
        isActive: rtp.permission.isActive,
        assignedAt: rtp.createdAt,
      });
      return acc;
    }, {});

    return NextResponse.json({
      roleTemplate: template,
      permissions: permissions.map((rtp) => ({
        id: rtp.permission.id,
        name: rtp.permission.name,
        displayName: rtp.permission.displayName,
        description: rtp.permission.description,
        category: rtp.permission.category,
        isActive: rtp.permission.isActive,
        assignedAt: rtp.createdAt,
      })),
      groupedByCategory,
      total: permissions.length,
    });
  } catch (error) {
    console.error("Error fetching template permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch template permissions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/role-templates/[templateId]/permissions
 * Add permissions to a role template
 */
export async function POST(
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

    // Check if template exists
    const template = await prisma.roleTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Role template not found" },
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

    // Get existing permissions for this template
    const existingPermissions = await prisma.roleTemplatePermission.findMany({
      where: { roleTemplateId: templateId },
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
    await prisma.roleTemplatePermission.createMany({
      data: newPermissionIds.map((permId) => ({
        roleTemplateId: templateId,
        permissionId: permId,
      })),
    });

    // Fetch updated permissions
    const updatedPermissions = await prisma.roleTemplatePermission.findMany({
      where: { roleTemplateId: templateId },
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
      permissions: updatedPermissions.map((rtp) => rtp.permission),
    });
  } catch (error) {
    console.error("Error adding template permissions:", error);
    return NextResponse.json(
      { error: "Failed to add template permissions" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/role-templates/[templateId]/permissions
 * Remove permissions from a role template
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
    const body = await _request.json();
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

    // Check if template exists
    const template = await prisma.roleTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Role template not found" },
        { status: 404 }
      );
    }

    // Remove permissions
    const result = await prisma.roleTemplatePermission.deleteMany({
      where: {
        roleTemplateId: templateId,
        permissionId: { in: permissionIds },
      },
    });

    // Fetch remaining permissions
    const remainingPermissions = await prisma.roleTemplatePermission.findMany({
      where: { roleTemplateId: templateId },
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
      remainingPermissions: remainingPermissions.map((rtp) => rtp.permission),
    });
  } catch (error) {
    console.error("Error removing template permissions:", error);
    return NextResponse.json(
      { error: "Failed to remove template permissions" },
      { status: 500 }
    );
  }
}
