import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";
import { validateRequestBody } from "@/utils/validateRequest";
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

    const { username, firstName, lastName, password, manager, role } =
      await validateRequestBody(request, userCreateSchema);

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
        role: role || "AGENT",
        manager: manager === "none" ? "" : manager,
        imageUrl: clerkUser.imageUrl,
      },
    });

    return successResponse({ user: newUser });
  } catch (error) {
    return handleApiError(error, "Failed to create user");
  }
}
