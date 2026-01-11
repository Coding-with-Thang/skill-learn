import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/utils/auth";
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
    const { userId } = adminResult;

    const users = await prisma.user.findMany({
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
    const { userId } = adminResult;

    const { user: currentUser } = adminResult;
    const { username, firstName, lastName, password, manager, role } =
      await validateRequestBody(request, userCreateSchema);

    const targetRole = role || "AGENT";

    // Validate role assignment permissions
    // Only OPERATIONS can create MANAGER or OPERATIONS roles
    if (currentUser.role === "MANAGER" && targetRole !== "AGENT") {
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
    if (manager && manager !== "" && manager !== "none") {
      const managerUser = await prisma.user.findUnique({
        where: { username: manager },
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

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
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
