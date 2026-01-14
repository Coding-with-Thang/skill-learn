import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";

/**
 * POST /api/onboarding/create-user
 * Create a user record during onboarding
 * Called after Clerk authentication is complete
 */
export async function POST(request) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, firstName, lastName, email } = body;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (user) {
      return NextResponse.json({
        user: {
          id: user.id,
          clerkId: user.clerkId,
        },
        message: "User already exists",
      });
    }

    // Generate a unique username
    const baseUsername = email?.split("@")[0] || firstName?.toLowerCase() || "user";
    let username = baseUsername;
    let counter = 1;
    
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create the user
    user = await prisma.user.create({
      data: {
        clerkId: clerkUserId,
        username,
        firstName: firstName || "User",
        lastName: lastName || "",
        role: "OWNER", // Will be workspace owner
        points: 0,
        lifetimePoints: 0,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        clerkId: user.clerkId,
        username: user.username,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
