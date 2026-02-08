import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

// Get all tenants with user counts
export async function GET(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }
    const tenants = await prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            tenantRoles: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format tenants with additional stats
    const formattedTenants = tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      subscriptionTier: tenant.subscriptionTier,
      maxRoleSlots: tenant.maxRoleSlots,
      baseRoleSlots: tenant.baseRoleSlots,
      purchasedRoleSlots: tenant.purchasedRoleSlots,
      requireEmailForRegistration: tenant.requireEmailForRegistration,
      activeUsers: tenant._count.users,
      roleCount: tenant._count.tenantRoles,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      stripeCustomerId: tenant.stripeCustomerId,
      stripeSubscriptionId: tenant.stripeSubscriptionId,
    }));

    return NextResponse.json({ tenants: formattedTenants });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

// Create a new tenant
export async function POST(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await request.json();
    const { name, slug, subscriptionTier } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: "A tenant with this slug already exists" },
        { status: 400 }
      );
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        subscriptionTier: subscriptionTier || "free",
        maxRoleSlots: 5,
        baseRoleSlots: 5,
        purchasedRoleSlots: 0,
      },
      include: {
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
        activeUsers: tenant._count.users,
        roleCount: tenant._count.tenantRoles,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Failed to create tenant" },
      { status: 500 }
    );
  }
}
