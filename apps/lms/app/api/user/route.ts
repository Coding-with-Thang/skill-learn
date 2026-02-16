import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

export async function GET(_request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    // Find the user in the db
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        tenant: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Get the user's display role from UserRole → TenantRole. When they have multiple
    // roles, prefer one that has admin permissions so the UI shows "Administrator" (or similar).
    const ADMIN_PERMISSIONS = [
      "dashboard.admin",
      "dashboard.manager",
      "roles.assign",
      "roles.create",
      "settings.update",
      "users.create",
      "users.update",
      "users.delete",
      "flashcards.manage_tenant",
    ];
    let roleAlias: string | null = null;
    if (user.tenantId) {
      const userRoles = await prisma.userRole.findMany({
        where: {
          userId: userId,
          tenantId: user.tenantId,
        },
        include: {
          tenantRole: {
            select: {
              roleAlias: true,
              isActive: true,
              tenantRolePermissions: {
                include: {
                  permission: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      });

      const activeRoles = userRoles.filter((ur) => ur.tenantRole?.isActive);
      const adminRole = activeRoles.find((ur) =>
        ur.tenantRole?.tenantRolePermissions?.some((trp) =>
          ADMIN_PERMISSIONS.includes(trp.permission?.name ?? "")
        )
      );
      const roleToShow = adminRole ?? activeRoles[0];
      if (roleToShow?.tenantRole?.roleAlias) {
        roleAlias = roleToShow.tenantRole.roleAlias;
      }
    }

    // Return user data with the actual roleAlias instead of legacy role field
    const userData = {
      ...user,
      role: roleAlias || user.role, // Use roleAlias if available, fallback to legacy role
    };

    return successResponse({ user: userData });
  } catch (error) {
    return handleApiError(error);
  }
}
