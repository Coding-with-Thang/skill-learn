import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

// Get a single tenant
export async function GET(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }
    const { tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
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
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

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
        activeUsers: tenant._count.users,
        roleCount: tenant._count.tenantRoles,
        quizCount: tenant._count.quizzes,
        courseCount: tenant._count.courses,
        rewardCount: tenant._count.rewards,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        stripeCustomerId: tenant.stripeCustomerId,
        stripeSubscriptionId: tenant.stripeSubscriptionId,
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

// Update a tenant
export async function PUT(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;
    const body = await request.json();
    const { name, slug, subscriptionTier, maxRoleSlots, defaultRoleId } = body;

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== existingTenant.slug) {
      const slugExists = await prisma.tenant.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A tenant with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // If defaultRoleId is being set, validate it belongs to this tenant
    if (defaultRoleId !== undefined) {
      if (defaultRoleId === null || defaultRoleId === "") {
        // Allow clearing the default role
      } else {
        const role = await prisma.tenantRole.findFirst({
          where: {
            id: defaultRoleId,
            tenantId,
          },
        });

        if (!role) {
          return NextResponse.json(
            { error: "Default role must belong to this tenant" },
            { status: 400 }
          );
        }
      }
    }

    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(subscriptionTier && { subscriptionTier }),
        ...(maxRoleSlots !== undefined && { maxRoleSlots }),
        ...(defaultRoleId !== undefined && { defaultRoleId: defaultRoleId || null }),
      },
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
          },
        },
      },
    });

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
        activeUsers: tenant._count.users,
        roleCount: tenant._count.tenantRoles,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json(
      { error: "Failed to update tenant" },
      { status: 500 }
    );
  }
}

// Delete a tenant
export async function DELETE(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // Warn if tenant has users (optional - you might want to prevent deletion)
    if (tenant._count.users > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete tenant with ${tenant._count.users} user(s). Please remove users first.`,
        },
        { status: 400 }
      );
    }

    // Delete tenant (cascade will handle related records)
    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    return NextResponse.json({ success: true, message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return NextResponse.json(
      { error: "Failed to delete tenant" },
      { status: 500 }
    );
  }
}
