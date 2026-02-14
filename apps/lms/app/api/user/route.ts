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

    // Get the user's actual role from UserRole → TenantRole
    let roleAlias: string | null = null;
    if (user.tenantId) {
      const userRole = await prisma.userRole.findFirst({
        where: {
          userId: userId,
          tenantId: user.tenantId,
        },
        include: {
          tenantRole: {
            select: {
              roleAlias: true,
            },
          },
        },
        orderBy: {
          assignedAt: "desc", // Get the most recently assigned role
        },
      });

      if (userRole?.tenantRole?.roleAlias) {
        roleAlias = userRole.tenantRole.roleAlias;
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
