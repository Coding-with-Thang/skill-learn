import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";

/**
 * GET /api/tenant
 * Get current user's tenant information
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
    }

    // Get user with tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        tenant: {
          include: {
            defaultRole: {
              select: {
                id: true,
                roleAlias: true,
                isActive: true,
              },
            },
            _count: {
              select: {
                users: true,
                tenantRoles: true,
                quizzes: true,
                courses: true,
                rewards: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    if (!user.tenant) {
      return NextResponse.json(
        { error: "No tenant assigned", tenant: null },
        { status: 200 }
      );
    }

    const tenant = user.tenant;

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subscriptionTier: tenant.subscriptionTier,
        maxRoleSlots: tenant.maxRoleSlots,
        baseRoleSlots: tenant.baseRoleSlots,
        purchasedRoleSlots: tenant.purchasedRoleSlots,
        defaultRoleId: tenant.defaultRoleId,
        defaultRole: tenant.defaultRole,
        stripeCustomerId: tenant.stripeCustomerId,
        stripeSubscriptionId: tenant.stripeSubscriptionId,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        stats: {
          users: tenant._count.users,
          roles: tenant._count.tenantRoles,
          quizzes: tenant._count.quizzes,
          courses: tenant._count.courses,
          rewards: tenant._count.rewards,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
