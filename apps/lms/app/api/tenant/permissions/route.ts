import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requirePermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions";
import { requireTenantContext } from "@skill-learn/lib/utils/tenant";

/**
 * GET /api/tenant/permissions
 * Get all available permissions (for role management UI)
 * Requires: roles.read permission
 */
export async function GET(_request: NextRequest) {
  try {
    // Get tenant context using standardized utility
    const tenantContext = await requireTenantContext();
    if (tenantContext instanceof NextResponse) {
      return tenantContext;
    }

    const { tenantId } = tenantContext;

    // Check permission
    const permResult = await requirePermission(PERMISSIONS.ROLES_READ, tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    // Get all active permissions
    const permissions = await prisma.permission.findMany({
      where: {
        isActive: true,
        isDeprecated: false,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Group by category
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
      });
      return acc;
    }, {});

    // Get categories
    const categories = Object.keys(groupedByCategory).sort();

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
