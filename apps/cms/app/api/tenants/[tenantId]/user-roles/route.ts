import { NextRequest, NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";
import { syncUserMetadataToClerk } from "@skill-learn/lib/utils/clerkSync";
import type { RouteContext } from "@/types";

type TenantIdParams = { tenantId: string };

/**
 * GET /api/tenants/[tenantId]/user-roles
 * Get all user role assignments for a tenant
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<TenantIdParams>
) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const roleId = searchParams.get("roleId");

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Build where clause
    const where: { tenantId: string; userId?: string; tenantRoleId?: string } = { tenantId };
    if (userId) {
      where.userId = userId;
    }
    if (roleId) {
      where.tenantRoleId = roleId;
    }

    const userRoles = await prisma.userRole.findMany({
      where,
      include: {
        tenantRole: {
          select: {
            id: true,
            roleAlias: true,
            description: true,
            slotPosition: true,
            isActive: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    // Try to get user details from User model where possible
    const userIds = [...new Set(userRoles.map((ur) => ur.userId))];
    const users = await prisma.user.findMany({
      where: { clerkId: { in: userIds } },
      select: {
        clerkId: true,
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.clerkId, u]));

    const formattedUserRoles = userRoles.map((ur) => {
      const userData = userMap.get(ur.userId);
      return {
        id: ur.id,
        userId: ur.userId,
        user: userData
          ? {
              username: userData.username,
              firstName: userData.firstName,
              lastName: userData.lastName,
              fullName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.username,
              imageUrl: userData.imageUrl,
            }
          : null,
        role: ur.tenantRole || null,
        assignedAt: ur.assignedAt,
        assignedBy: ur.assignedBy,
      };
    });

    return NextResponse.json({
      tenant,
      userRoles: formattedUserRoles,
      total: formattedUserRoles.length,
    });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : undefined);
    return NextResponse.json(
      { error: "Failed to fetch user roles", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants/[tenantId]/user-roles
 * Assign a role to a user
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext<TenantIdParams>
) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { userId: adminUserId } = adminResult;
    const { tenantId } = await params;
    const body = await request.json();
    const { userId, tenantRoleId } = body;

    // Validate required fields
    if (!userId || !tenantRoleId) {
      return NextResponse.json(
        { error: "userId and tenantRoleId are required" },
        { status: 400 }
      );
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Check if role exists and belongs to tenant
    const role = await prisma.tenantRole.findFirst({
      where: {
        id: tenantRoleId,
        tenantId,
        isActive: true,
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found or is not active" },
        { status: 404 }
      );
    }

    // Check if user already has this role in this tenant
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId,
        tenantRoleId,
      },
    });

    if (existingUserRole) {
      return NextResponse.json(
        { error: "User already has this role assigned" },
        { status: 400 }
      );
    }

    // Create user role assignment
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        tenantId,
        tenantRoleId,
        assignedBy: adminUserId,
      },
      include: {
        tenantRole: {
          select: {
            id: true,
            roleAlias: true,
            description: true,
            slotPosition: true,
          },
        },
      },
    });

    // Sync user metadata to Clerk (includes new role/permissions)
    try {
      await syncUserMetadataToClerk(userId, tenantId);
    } catch (syncError) {
      console.error("Failed to sync user metadata to Clerk:", syncError);
      // Don't fail the request, role was assigned successfully
    }

    // Try to get user details
    const userData = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
      },
    });

    return NextResponse.json(
      {
        userRole: {
          id: userRole.id,
          userId: userRole.userId,
          user: userData
            ? {
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                fullName: `${userData.firstName} ${userData.lastName}`,
                imageUrl: userData.imageUrl,
              }
            : null,
          role: userRole.tenantRole,
          assignedAt: userRole.assignedAt,
          assignedBy: userRole.assignedBy,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error assigning user role:", error);
    return NextResponse.json(
      { error: "Failed to assign user role" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tenants/[tenantId]/user-roles
 * Reassign a user to a different role (user must have a role; use this to change it)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext<TenantIdParams>
) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { userId: adminUserId } = adminResult;
    const { tenantId } = await params;
    const body = await request.json();
    const { userRoleId, tenantRoleId: newTenantRoleId } = body;

    if (!userRoleId || !newTenantRoleId) {
      return NextResponse.json(
        { error: "userRoleId and tenantRoleId are required" },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const existingUserRole = await prisma.userRole.findFirst({
      where: { id: userRoleId, tenantId },
      include: {
        tenantRole: {
          select: { id: true, roleAlias: true },
        },
      },
    });

    if (!existingUserRole) {
      return NextResponse.json(
        { error: "User role assignment not found" },
        { status: 404 }
      );
    }

    const newRole = await prisma.tenantRole.findFirst({
      where: {
        id: newTenantRoleId,
        tenantId,
        isActive: true,
      },
    });

    if (!newRole) {
      return NextResponse.json(
        { error: "Target role not found or is not active" },
        { status: 404 }
      );
    }

    if (existingUserRole.tenantRoleId === newTenantRoleId) {
      return NextResponse.json(
        { error: "User already has this role" },
        { status: 400 }
      );
    }

    const updatedUserRole = await prisma.userRole.update({
      where: { id: userRoleId },
      data: {
        tenantRoleId: newTenantRoleId,
        assignedBy: adminUserId,
      },
      include: {
        tenantRole: {
          select: {
            id: true,
            roleAlias: true,
            description: true,
            slotPosition: true,
          },
        },
      },
    });

    try {
      await syncUserMetadataToClerk(existingUserRole.userId, tenantId);
    } catch (syncError) {
      console.error("Failed to sync user metadata to Clerk:", syncError);
    }

    const userData = await prisma.user.findUnique({
      where: { clerkId: existingUserRole.userId },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({
      userRole: {
        id: updatedUserRole.id,
        userId: updatedUserRole.userId,
        user: userData
          ? {
              username: userData.username,
              firstName: userData.firstName,
              lastName: userData.lastName,
              fullName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.username,
              imageUrl: userData.imageUrl,
            }
          : null,
        role: updatedUserRole.tenantRole,
        assignedAt: updatedUserRole.assignedAt,
        assignedBy: updatedUserRole.assignedBy,
      },
    });
  } catch (error) {
    console.error("Error reassigning user role:", error);
    return NextResponse.json(
      { error: "Failed to reassign user role" },
      { status: 500 }
    );
  }
}
