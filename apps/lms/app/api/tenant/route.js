import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";

/**
 * GET /api/tenant
 * Get current user's tenant information
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        tenant: {
          include: {
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    console.error("Error fetching tenant:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant" },
      { status: 500 }
    );
  }
}
