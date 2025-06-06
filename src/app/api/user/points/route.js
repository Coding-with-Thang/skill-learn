import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      throw new AppError("Unauthorized - No user found", ErrorType.AUTH, {
        status: 401,
      });
    }

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        points: true,
        lifetimePoints: true,
      },
    });

    if (!dbUser) {
      // Try to create the user if they don't exist
      try {
        // Get user details from Clerk
        const clerkUser = await fetch(
          `https://api.clerk.dev/v1/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            },
          }
        ).then((res) => res.json());

        // Generate a username from email or name
        const email = clerkUser.email_addresses[0]?.email_address;
        const username = email
          ? email.split("@")[0]
          : `${clerkUser.first_name?.toLowerCase() || ""}${
              clerkUser.last_name?.toLowerCase() || ""
            }`;

        // Create new user
        const newUser = await prisma.user.create({
          data: {
            clerkId: userId,
            email: email,
            username: username,
            firstName: clerkUser.first_name,
            lastName: clerkUser.last_name,
            points: 0,
            lifetimePoints: 0,
          },
        });

        return NextResponse.json({
          success: true,
          points: newUser.points,
          lifetimePoints: newUser.lifetimePoints,
        });
      } catch (error) {
        throw new AppError("Failed to create user", ErrorType.API, error);
      }
    }

    return NextResponse.json({
      success: true,
      points: dbUser.points,
      lifetimePoints: dbUser.lifetimePoints,
    });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
