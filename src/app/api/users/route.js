import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from "@/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";
import { validateRequestBody } from "@/lib/utils/validateRequest";
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
    if (manager && manager !== "" && manager !== "none" && targetRole !== "AGENT") {
      throw new AppError("Manager can only be assigned to agents", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    // Validate manager exists if provided
    if (manager && manager !== "" && manager !== "none") {
      const managerUser = await prisma.user.findUnique({
        where: { username: manager },
        select: { id: true, role: true }
      });

      if (!managerUser) {
        throw new AppError("Manager not found", ErrorType.NOT_FOUND, {
          status: 404,
        });
      }

      if (managerUser.role !== "MANAGER") {
        throw new AppError("Assigned manager must have MANAGER role", ErrorType.VALIDATION, {
          status: 400,
        });
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
        manager: (manager === "none" || manager === "" || targetRole !== "AGENT") ? "" : manager,
        imageUrl: clerkUser.imageUrl,
      },
    });

    return successResponse({ user: newUser });
  } catch (error) {
    return handleApiError(error, "Failed to create user");
  }
}
