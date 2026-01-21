import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { requirePermission, hasPermission } from "@skill-learn/lib/utils/permissions.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequest, validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { userCreateSchema } from "@/lib/zodSchemas";

export async function GET(request) {
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
        tenantId: tenantId, // Only return users from the current tenant
      },
      select: {
        id: true,
        clerkId: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        manager: true,
        imageUrl: true,
        points: true,
        lifetimePoints: true,
        createdAt: true,
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

    // Create a map of userId -> roleAlias (most recent role)
    const userRoleMap = new Map();
    userRoles.forEach(ur => {
      if (!userRoleMap.has(ur.userId) && ur.tenantRole?.roleAlias) {
        userRoleMap.set(ur.userId, ur.tenantRole.roleAlias);
      }
    });

    // Add tenant role to each user
    const usersWithRoles = users.map(user => ({
      ...user,
      tenantRole: userRoleMap.get(user.clerkId) || null, // Add tenant role alias
    }));

    return successResponse({ users: usersWithRoles });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
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

    // Parse body and extract tenantRoleId (may not be in schema yet)
    const body = await request.json();
    const { tenantRoleId } = body;
    
    // Validate request body using schema (legacy role field)
    const validatedData = await validateRequest(userCreateSchema, body);
    const { username, firstName, lastName, password, manager, role } = validatedData;

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
        // If user can't assign roles, they can only assign the default role
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

    // Legacy role support for backward compatibility
    const targetRole = role || "AGENT";

    // Validate manager assignment (legacy - only for backward compatibility)
    if (
      manager &&
      manager !== "" &&
      manager !== "none" &&
      targetRole !== "AGENT"
    ) {
      throw new AppError(
        "Manager can only be assigned to agents",
        ErrorType.VALIDATION,
        {
          status: 400,
        }
      );
    }

    // Validate manager exists if provided (legacy)
    if (manager && manager !== "" && manager !== "none") {
      const managerUser = await prisma.user.findFirst({
        where: { 
          username: manager,
          tenantId: tenantId,
        },
        select: { id: true, role: true },
      });

      if (!managerUser) {
        throw new AppError("Manager not found", ErrorType.NOT_FOUND, {
          status: 404,
        });
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
    const existingClerkUsers = await clerkClient.users.getUserList({
      username: [username],
    });

    if (existingClerkUsers.length > 0) {
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
    const clerkUser = await clerkClient.users.createUser({
      firstName,
      lastName,
      password,
      username,
    }); 

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        username,
        firstName,
        lastName,
        role: targetRole, // Legacy role field for backward compatibility
        tenantId: tenantId,
        manager:
          manager === "none" ||
          manager === "" ||
          (targetRole !== "AGENT" && targetRole !== "MANAGER")
            ? ""
            : manager,
        imageUrl: clerkUser.imageUrl,
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
        const { syncUserMetadataToClerk } = await import("@skill-learn/lib/utils/clerkSync.js");
        await syncUserMetadataToClerk(clerkUser.id, tenantId);
      } catch (syncError) {
        console.error("Failed to sync user metadata to Clerk:", syncError);
        // Don't fail the request, user was created successfully
      }
    }

    return successResponse({ user: newUser });
  } catch (error) {
    return handleApiError(error, "Failed to create user");
  }
}
