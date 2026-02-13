import { NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";

/**
 * GET /api/permissions
 * Get all permissions (optionally filtered by category or status)
 */
export async function GET(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    const includeDeprecated = searchParams.get("includeDeprecated") === "true";

    // Build where clause
    const where = {};
    if (category) {
      where.category = category;
    }
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    if (!includeDeprecated) {
      where.isDeprecated = false;
    }

    const permissions = await prisma.permission.findMany({
      where,
      include: {
        replacementPermission: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            roleTemplatePermissions: true,
            tenantRolePermissions: true,
          },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Group permissions by category
    const groupedByCategory = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push({
        id: perm.id,
        name: perm.name,
        displayName: perm.displayName,
        description: perm.description,
        category: perm.category,
        isActive: perm.isActive,
        isDeprecated: perm.isDeprecated,
        deprecatedAt: perm.deprecatedAt,
        sunsetDate: perm.sunsetDate,
        replacementPermission: perm.replacementPermission,
        usageCount:
          perm._count.roleTemplatePermissions +
          perm._count.tenantRolePermissions,
        createdAt: perm.createdAt,
      });
      return acc;
    }, {});

    // Get unique categories
    const categories = [...new Set(permissions.map((p) => p.category))].sort();

    return NextResponse.json({
      permissions,
      groupedByCategory,
      categories,
      total: permissions.length,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/permissions
 * Create a new permission (super admin only)
 */
export async function POST(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await request.json();
    const { name, displayName, description, category } = body;

    // Validate required fields
    if (!name || !displayName || !category) {
      return NextResponse.json(
        { error: "Name, displayName, and category are required" },
        { status: 400 }
      );
    }

    // Validate permission name format (resource.action)
    const namePattern = /^[a-z_]+\.[a-z_]+$/;
    if (!namePattern.test(name)) {
      return NextResponse.json(
        {
          error:
            'Permission name must be in format "resource.action" (lowercase with underscores)',
        },
        { status: 400 }
      );
    }

    // Check if permission already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name },
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: "A permission with this name already exists" },
        { status: 400 }
      );
    }

    // Create permission
    const permission = await prisma.permission.create({
      data: {
        name,
        displayName,
        description: description || null,
        category,
        isActive: true,
      },
    });

    return NextResponse.json({ permission }, { status: 201 });
  } catch (error) {
    console.error("Error creating permission:", error);
    return NextResponse.json(
      { error: "Failed to create permission" },
      { status: 500 }
    );
  }
}
