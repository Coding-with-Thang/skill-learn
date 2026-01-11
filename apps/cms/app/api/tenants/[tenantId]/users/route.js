import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

// Get all users for a tenant
export async function GET(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // Get all users for this tenant
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        clerkId: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        role: true,
        points: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching tenant users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Move users to a different tenant
export async function POST(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;
    const body = await request.json();
    const { userIds, targetTenantId } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds array is required" },
        { status: 400 }
      );
    }

    if (!targetTenantId) {
      return NextResponse.json(
        { error: "targetTenantId is required" },
        { status: 400 }
      );
    }

    // Verify source tenant exists
    const sourceTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!sourceTenant) {
      return NextResponse.json(
        { error: "Source tenant not found" },
        { status: 404 }
      );
    }

    // Verify target tenant exists
    const targetTenant = await prisma.tenant.findUnique({
      where: { id: targetTenantId },
    });

    if (!targetTenant) {
      return NextResponse.json(
        { error: "Target tenant not found" },
        { status: 404 }
      );
    }

    if (tenantId === targetTenantId) {
      return NextResponse.json(
        { error: "Source and target tenants cannot be the same" },
        { status: 400 }
      );
    }

    // Verify all users exist and belong to source tenant
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        tenantId,
      },
    });

    if (users.length !== userIds.length) {
      return NextResponse.json(
        { error: "Some users were not found or don't belong to the source tenant" },
        { status: 400 }
      );
    }

    // Move users to target tenant
    // Also need to remove their UserRole assignments from source tenant
    const result = await prisma.$transaction(async (tx) => {
      // Update users' tenantId
      const updatedUsers = await tx.user.updateMany({
        where: {
          id: { in: userIds },
        },
        data: {
          tenantId: targetTenantId,
        },
      });

      // Get Clerk IDs for these users
      const userClerkIds = users.map(u => u.clerkId);

      // Remove UserRole assignments from source tenant
      await tx.userRole.deleteMany({
        where: {
          userId: { in: userClerkIds },
          tenantId,
        },
      });

      return updatedUsers;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully moved ${result.count} user(s) to ${targetTenant.name}`,
      movedCount: result.count,
    });
  } catch (error) {
    console.error("Error moving users:", error);
    return NextResponse.json(
      { error: "Failed to move users" },
      { status: 500 }
    );
  }
}
