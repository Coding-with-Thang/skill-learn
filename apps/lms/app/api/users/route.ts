import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { requirePermission, hasPermission } from "@skill-learn/lib/utils/permissions";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { logSecurityEvent } from "@skill-learn/lib/utils/security/logger";
import { SECURITY_EVENT_CATEGORIES, SECURITY_EVENT_TYPES } from "@skill-learn/lib/utils/security/eventTypes";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequest, validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { userCreateSchema } from "@/lib/zodSchemas";

export async function GET(_request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }
    const { userId, tenantId } = adminResult;
    
    // Check for users.read permission
    const permResult = await requirePermission('users.read', tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    // CRITICAL: Filter users by tenantId to prevent data leakage
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant context required" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId: tenantId,
      },
      select: {
        id: true,
        clerkId: true,
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        points: true,
        lifetimePoints: true,
        createdAt: true,
        reportsToUserId: true,
        reportsTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get user roles for all users
    const userIds = users.map(u => u.clerkId);
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: { in: userIds },
        tenantId: tenantId,
      },
      include: {
        tenantRole: {
          select: {
            id: true,
            roleAlias: true,
          },
        },
      },
      orderBy: {
        assignedAt: "desc", // Get most recently assigned role
      },
    });

    // Map userId -> { roleAlias, tenantRoleId } (most recent role per user)
    const userRoleMap = new Map();
    userRoles.forEach(ur => {
      if (!userRoleMap.has(ur.userId) && ur.tenantRole) {
        userRoleMap.set(ur.userId, {
          tenantRole: ur.tenantRole.roleAlias,
          tenantRoleId: ur.tenantRole.id,
        });
      }
    });

    const usersWithRoles = users.map(user => {
      const roleInfo = userRoleMap.get(user.clerkId);
      return {
        ...user,
        tenantRole: roleInfo?.tenantRole ?? null,
        tenantRoleId: roleInfo?.tenantRoleId ?? null,
      };
    });

    return successResponse({ users: usersWithRoles });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }
    const { userId, tenantId, user: currentUser } = adminResult;
    
    // Check for users.create permission
    const permResult = await requirePermission('users.create', tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    const body = await request.json();

    // Validate request body (tenant-only: tenantRoleId, reportsToUserId optional)
    const validatedData = await validateRequest(userCreateSchema, body);
    const { username, firstName, lastName, password, tenantRoleId, reportsToUserId } = validatedData;

    // Determine target tenant role ID
    let targetTenantRoleId = tenantRoleId;

    // If tenantRoleId not provided, use tenant's defaultRoleId
    if (!targetTenantRoleId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { defaultRoleId: true },
      });

      if (tenant?.defaultRoleId) {
        targetTenantRoleId = tenant.defaultRoleId;
      }
    }

    // Validate tenantRoleId if provided
    if (targetTenantRoleId) {
      const tenantRole = await prisma.tenantRole.findFirst({
        where: {
          id: targetTenantRoleId,
          tenantId,
          isActive: true,
        },
      });

      if (!tenantRole) {
        throw new AppError(
          "Tenant role not found or is not active",
          ErrorType.NOT_FOUND,
          { status: 404 }
        );
      }

      // Check if user can assign roles - requires roles.assign permission
      const canAssignRoles = await hasPermission(userId, 'roles.assign', tenantId);

      if (!canAssignRoles) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { defaultRoleId: true },
        });

        if (targetTenantRoleId !== tenant?.defaultRoleId) {
          throw new AppError(
            "You do not have permission to assign this role. Only the default role can be assigned.",
            ErrorType.FORBIDDEN,
            { status: 403 }
          );
        }
      }
    }

    // Validate reportsToUserId if provided (must be same tenant)
    const reportsToId = reportsToUserId ?? null;
    if (reportsToId) {
      const managerUser = await prisma.user.findUnique({
        where: { id: reportsToId },
        select: { tenantId: true },
      });
      if (!managerUser || managerUser.tenantId !== tenantId) {
        throw new AppError(
          "Reports-to must be a user in the same organization",
          ErrorType.VALIDATION,
          { status: 400 }
        );
      }
    }

    // Check if username exists globally (usernames are globally unique)
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      throw new AppError("Username already exists", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    // Check if username exists in Clerk
    const client = await clerkClient();
    const existingClerkUsers = await client.users.getUserList({
      username: [username],
    });

    if ((existingClerkUsers.data?.length ?? 0) > 0) {
      throw new AppError(
        "Username already exists in authentication system",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }

    // CRITICAL: Ensure tenantId is set when creating user
    if (!tenantId) {
      throw new AppError(
        "Tenant context required to create user",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }

    // Create user in Clerk
    const clerkUser = await client.users.createUser({
      firstName,
      lastName,
      password,
      username,
    }); 

    // Create user in database (tenant-only; role is assigned via UserRole)
    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        username,
        firstName,
        lastName,
        role: "AGENT",
        tenantId: tenantId,
        imageUrl: clerkUser.imageUrl,
        ...(reportsToId && { reportsToUserId: reportsToId }),
      },
    });

    // Create UserRole assignment if tenantRoleId is provided
    if (targetTenantRoleId) {
      await prisma.userRole.create({
        data: {
          userId: clerkUser.id, // Use Clerk ID
          tenantId: tenantId,
          tenantRoleId: targetTenantRoleId,
          assignedBy: userId, // Admin who created the user
        },
      });

      // Sync user metadata to Clerk (includes role/permissions)
      try {
        const { syncUserMetadataToClerk } = await import("@skill-learn/lib/utils/clerkSync");
        await syncUserMetadataToClerk(clerkUser.id, tenantId);
      } catch (syncError) {
        console.error("Failed to sync user metadata to Clerk:", syncError);
        // Don't fail the request, user was created successfully
      }
    }

    await logSecurityEvent({
      actorUserId: currentUser.id,
      actorClerkId: userId,
      tenantId: tenantId || undefined,
      eventType: SECURITY_EVENT_TYPES.USER_CREATED,
      category: SECURITY_EVENT_CATEGORIES.USER_MANAGEMENT,
      action: "create",
      resource: "user",
      resourceId: newUser.id,
      severity: "high",
      message: `Created user: ${newUser.username}`,
      details: {
        createdUserId: newUser.id,
        createdClerkId: newUser.clerkId,
        assignedTenantRoleId: targetTenantRoleId || null,
        reportsToUserId: reportsToId || null,
      },
      request,
    });

    return successResponse({ user: newUser });
  } catch (error) {
    return handleApiError(error, "Failed to create user");
  }
}
