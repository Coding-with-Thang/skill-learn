import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { requirePermission, hasPermission } from "@skill-learn/lib/utils/permissions.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
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

    return successResponse({ users });
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

    const { username, firstName, lastName, password, manager, role } =
      await validateRequestBody(request, userCreateSchema);

    const targetRole = role || "AGENT";

    // Check if user can assign roles - requires roles.assign permission
    const canAssignRoles = await hasPermission(userId, 'roles.assign', tenantId);
    
    // Validate role assignment permissions
    // Users without roles.assign permission can only create AGENT roles
    if (!canAssignRoles && targetRole !== "AGENT") {
      throw new AppError(
        "You do not have permission to create users with this role",
        ErrorType.FORBIDDEN,
        { status: 403 }
      );
    }
    
    // Legacy role-based restriction for backward compatibility
    if (!canAssignRoles && currentUser.role === "MANAGER" && targetRole !== "AGENT") {
      throw new AppError(
        "Managers can only create users with AGENT role",
        ErrorType.FORBIDDEN,
        { status: 403 }
      );
    }

    // Validate manager assignment
    // Manager field should only be set for AGENT role
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

    // Validate manager exists if provided
    // - AGENT role: manager can be MANAGER or OPERATIONS
    // - MANAGER role: manager must be OPERATIONS only
    // NOTE: Manager lookup is scoped to tenant for security (ensures manager is in same tenant)
    if (manager && manager !== "" && manager !== "none") {
      const managerUser = await prisma.user.findFirst({
        where: { 
          username: manager,
          tenantId: tenantId, // Only find managers within the same tenant (security check)
        },
        select: { id: true, role: true },
      });

      if (!managerUser) {
        throw new AppError("Manager not found", ErrorType.NOT_FOUND, {
          status: 404,
        });
      }

      // If target role is MANAGER, manager must be OPERATIONS
      if (targetRole === "MANAGER") {
        if (managerUser.role !== "OPERATIONS") {
          throw new AppError(
            "Users with MANAGER role can only be assigned a manager with OPERATIONS role",
            ErrorType.VALIDATION,
            {
              status: 400,
            }
          );
        }
      } else if (targetRole === "AGENT") {
        // Agents can have MANAGER or OPERATIONS as manager
        if (
          managerUser.role !== "MANAGER" &&
          managerUser.role !== "OPERATIONS"
        ) {
          throw new AppError(
            "Assigned manager must have MANAGER or OPERATIONS role",
            ErrorType.VALIDATION,
            {
              status: 400,
            }
          );
        }
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
    }); // Create user in database
    const newUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        username,
        firstName,
        lastName,
        role: targetRole,
        tenantId: tenantId, // CRITICAL: Assign user to current tenant
        manager:
          manager === "none" ||
          manager === "" ||
          (targetRole !== "AGENT" && targetRole !== "MANAGER")
            ? ""
            : manager,
        imageUrl: clerkUser.imageUrl,
      },
    });

    return successResponse({ user: newUser });
  } catch (error) {
    return handleApiError(error, "Failed to create user");
  }
}
