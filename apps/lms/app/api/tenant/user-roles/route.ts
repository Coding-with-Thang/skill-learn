import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import {
  requirePermission,
  requireAnyPermission,
  PERMISSIONS,
} from "@skill-learn/lib/utils/permissions";
import { syncUserMetadataToClerk } from "@skill-learn/lib/utils/clerkSync";
import { requireTenantContext } from "@skill-learn/lib/utils/tenant";

/**
 * GET /api/tenant/user-roles
 * Get all user role assignments for the tenant
 * Requires: roles.read or roles.assign permission
 */
export async function GET(request: NextRequest) {
  try {
    // Get tenant context using standardized utility
    const tenantContext = await requireTenantContext();
    if (tenantContext instanceof NextResponse) {
      return tenantContext;
    }

    const { tenantId } = tenantContext;

    // Check permission
    const permResult = await requireAnyPermission(
      [PERMISSIONS.ROLES_READ, PERMISSIONS.ROLES_ASSIGN],
      tenantId
    );
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    const { searchParams } = new URL(request.url);
    const filterUserId = searchParams.get("userId");
    const filterRoleId = searchParams.get("roleId");

    // Build where clause
    const where: { tenantId: string; userId?: string; tenantRoleId?: string } = { tenantId };
    if (filterUserId) where.userId = filterUserId;
    if (filterRoleId) where.tenantRoleId = filterRoleId;

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
            createdFromTemplateId: true,
            createdFromTemplate: {
              select: { id: true, templateSetName: true },
            },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    // Get user details
    const userIds = [...new Set(userRoles.map((ur) => ur.userId))];
    const users = await prisma.user.findMany({
      where: { clerkId: { in: userIds } },
      select: {
        clerkId: true,
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        email: true,
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
              fullName: `${userData.firstName} ${userData.lastName}`,
              imageUrl: userData.imageUrl,
              email: userData.email,
            }
          : null,
        role: ur.tenantRole,
        assignedAt: ur.assignedAt,
        assignedBy: ur.assignedBy,
      };
    });

    return NextResponse.json({
      userRoles: formattedUserRoles,
      total: formattedUserRoles.length,
    });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user roles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenant/user-roles
 * Assign a role to a user
 * Requires: roles.assign permission
 */
export async function POST(request: NextRequest) {
  try {
    // Get tenant context using standardized utility
    const tenantContext = await requireTenantContext();
    if (tenantContext instanceof NextResponse) {
      return tenantContext;
    }

    const { tenantId, userId: currentUserId } = tenantContext;

    // Check permission
    const permResult = await requirePermission(PERMISSIONS.ROLES_ASSIGN, tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    const body = await request.json();
    const { userId, tenantRoleId } = body;

    if (!userId || !tenantRoleId) {
      return NextResponse.json(
        { error: "userId and tenantRoleId are required" },
        { status: 400 }
      );
    }

    // Verify role belongs to tenant and is active
    const role = await prisma.tenantRole.findFirst({
      where: {
        id: tenantRoleId,
        tenantId: tenantId,
        isActive: true,
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found or inactive" },
        { status: 404 }
      );
    }

    // Verify user belongs to tenant
    const targetUser = await prisma.user.findFirst({
      where: {
        clerkId: userId,
        tenantId: tenantId,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found in this tenant" },
        { status: 404 }
      );
    }

    // Check if already assigned
    const existing = await prisma.userRole.findFirst({
      where: { userId, tenantRoleId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already has this role" },
        { status: 400 }
      );
    }

    // Create assignment
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        tenantId: tenantId,
        tenantRoleId,
        assignedBy: currentUserId,
      },
      include: {
        tenantRole: {
          select: {
            id: true,
            roleAlias: true,
            description: true,
          },
        },
      },
    });

    // Sync to Clerk
    try {
      await syncUserMetadataToClerk(userId, tenantId);
    } catch (err) {
      console.error("Failed to sync to Clerk:", err);
    }

    return NextResponse.json(
      {
        userRole: {
          id: userRole.id,
          userId: userRole.userId,
          role: userRole.tenantRole,
          assignedAt: userRole.assignedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error assigning role:", error);
    return NextResponse.json(
      { error: "Failed to assign role" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tenant/user-roles
 * Remove a role from a user
 * Requires: roles.assign permission
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get tenant context using standardized utility
    const tenantContext = await requireTenantContext();
    if (tenantContext instanceof NextResponse) {
      return tenantContext;
    }

    const { tenantId } = tenantContext;

    // Check permission
    const permResult = await requirePermission(PERMISSIONS.ROLES_ASSIGN, tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    // Get params from URL or body
    const { searchParams } = new URL(request.url);
    let userRoleId = searchParams.get("userRoleId");
    let userId = searchParams.get("userId");
    let tenantRoleId = searchParams.get("tenantRoleId");

    if (!userRoleId && !userId) {
      try {
        const body = await request.json();
        userRoleId = body.userRoleId;
        userId = body.userId;
        tenantRoleId = body.tenantRoleId;
      } catch (e) {
        // Body parsing failed
      }
    }

    let deletedUserRole: Awaited<ReturnType<typeof prisma.userRole.findFirst>> = null;

    if (userRoleId) {
      const userRole = await prisma.userRole.findFirst({
        where: { id: userRoleId, tenantId: tenantId },
      });

      if (!userRole) {
        return NextResponse.json(
          { error: "User role assignment not found" },
          { status: 404 }
        );
      }

      deletedUserRole = userRole;
      await prisma.userRole.delete({ where: { id: userRoleId } });
    } else if (userId && tenantRoleId) {
      const userRole = await prisma.userRole.findFirst({
        where: { userId, tenantRoleId, tenantId: tenantId },
      });

      if (!userRole) {
        return NextResponse.json(
          { error: "User role assignment not found" },
          { status: 404 }
        );
      }

      deletedUserRole = userRole;
      await prisma.userRole.delete({ where: { id: userRole.id } });
    } else {
      return NextResponse.json(
        { error: "userRoleId or both userId and tenantRoleId required" },
        { status: 400 }
      );
    }

    // Sync to Clerk
    if (deletedUserRole) {
      try {
        await syncUserMetadataToClerk(deletedUserRole.userId, tenantId);
      } catch (err) {
        console.error("Failed to sync to Clerk:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Role assignment removed",
    });
  } catch (error) {
    console.error("Error removing role:", error);
    return NextResponse.json(
      { error: "Failed to remove role" },
      { status: 500 }
    );
  }
}
