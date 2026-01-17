import { NextResponse } from "next/server";
import prisma from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";
import { syncUserMetadataToClerk } from "@skill-learn/lib/utils/clerkSync.js";

/**
 * GET /api/tenants/[tenantId]/user-roles
 * Get all user role assignments for a tenant
 */
export async function GET(request, { params }) {
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
    const where = { tenantId };
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
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to fetch user roles", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants/[tenantId]/user-roles
 * Assign a role to a user
 */
export async function POST(request, { params }) {
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
 * DELETE /api/tenants/[tenantId]/user-roles
 * Remove a role from a user (via query params or body)
 */
export async function DELETE(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;

    // Support both query params and body
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");
    let tenantRoleId = searchParams.get("tenantRoleId");
    let userRoleId = searchParams.get("userRoleId");

    // Try to get from body if not in query params
    if (!userRoleId && !userId) {
      try {
        const body = await request.json();
        userId = body.userId;
        tenantRoleId = body.tenantRoleId;
        userRoleId = body.userRoleId;
      } catch (e) {
        // Body parsing failed, use query params
      }
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Delete by userRoleId (preferred) or by userId + tenantRoleId
    let deletedUserRole = null;

    if (userRoleId) {
      const userRole = await prisma.userRole.findFirst({
        where: {
          id: userRoleId,
          tenantId,
        },
      });

      if (!userRole) {
        return NextResponse.json(
          { error: "User role assignment not found" },
          { status: 404 }
        );
      }

      deletedUserRole = userRole;
      await prisma.userRole.delete({
        where: { id: userRoleId },
      });
    } else if (userId && tenantRoleId) {
      const userRole = await prisma.userRole.findFirst({
        where: {
          userId,
          tenantRoleId,
          tenantId,
        },
      });

      if (!userRole) {
        return NextResponse.json(
          { error: "User role assignment not found" },
          { status: 404 }
        );
      }

      deletedUserRole = userRole;
      await prisma.userRole.delete({
        where: { id: userRole.id },
      });
    } else {
      return NextResponse.json(
        {
          error:
            "Either userRoleId or both userId and tenantRoleId are required",
        },
        { status: 400 }
      );
    }

    // Sync user metadata to Clerk (remove role/permissions)
    if (deletedUserRole) {
      try {
        await syncUserMetadataToClerk(deletedUserRole.userId, tenantId);
      } catch (syncError) {
        console.error("Failed to sync user metadata to Clerk:", syncError);
        // Don't fail the request, role was removed successfully
      }
    }

    return NextResponse.json({
      success: true,
      message: "User role assignment removed successfully",
    });
  } catch (error) {
    console.error("Error removing user role:", error);
    return NextResponse.json(
      { error: "Failed to remove user role" },
      { status: 500 }
    );
  }
}
