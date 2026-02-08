import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { requirePermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions.js";

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

/**
 * PATCH /api/tenant
 * Update tenant settings (e.g. default role).
 * Allowed: user has settings.update OR onboarding not yet completed.
 */
export async function PATCH(request) {
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

    const body = await request.json().catch(() => ({}));
    const { defaultRoleId } = body;

    if (defaultRoleId === undefined) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 }
      );
    }

    // Allow if user has settings.update OR onboarding not completed
    const hasSettingsUpdate = await requirePermission(PERMISSIONS.SETTINGS_UPDATE, user.tenantId);
    const allowedByPermission = hasSettingsUpdate instanceof NextResponse === false;
    let allowedByOnboarding = false;
    if (!allowedByPermission) {
      const setting = await prisma.systemSetting.findFirst({
        where: {
          tenantId: user.tenantId,
          key: "onboardingCompleted",
          category: "onboarding",
        },
        select: { value: true },
      });
      allowedByOnboarding = setting?.value === "false";
    }

    if (!allowedByPermission && !allowedByOnboarding) {
      throw new AppError("You do not have permission to update tenant settings", ErrorType.FORBIDDEN, { status: 403 });
    }

    if (defaultRoleId !== null) {
      const role = await prisma.tenantRole.findFirst({
        where: {
          id: defaultRoleId,
          tenantId: user.tenantId,
          isActive: true,
        },
        select: { id: true },
      });
      if (!role) {
        throw new AppError("Invalid or inactive role for this tenant", ErrorType.VALIDATION, { status: 400 });
      }
    }

    const updated = await prisma.tenant.update({
      where: { id: user.tenantId },
      data: { defaultRoleId: defaultRoleId || null },
      select: {
        id: true,
        defaultRoleId: true,
        defaultRole: {
          select: { id: true, roleAlias: true, isActive: true },
        },
      },
    });

    return NextResponse.json({
      tenant: {
        id: updated.id,
        defaultRoleId: updated.defaultRoleId,
        defaultRole: updated.defaultRole,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
