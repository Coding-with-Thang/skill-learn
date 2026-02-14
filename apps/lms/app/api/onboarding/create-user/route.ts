import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";

/**
 * POST /api/onboarding/create-user
 * Create a user record during onboarding
 * Called after Clerk authentication is complete
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, firstName, lastName, email, username: providedUsername } = body;

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

    // Use provided username (e.g. from username-only sign-up), or derive from email/name
    // Usernames are globally unique (enforced by both Clerk and database)
    const baseUsername = providedUsername?.trim() || email?.split("@")[0] || firstName?.toLowerCase() || "user";
    let username = baseUsername;
    let counter = 1;
    
    // Check both Clerk and database for username uniqueness
    let usernameExists = true;
    while (usernameExists) {
      // Check Clerk first (enforces global uniqueness)
      try {
        const client = await clerkClient();
        const clerkUsers = await client.users.getUserList({
          username: [username],
          limit: 1,
        });
        if (clerkUsers?.data?.length > 0) {
          username = `${baseUsername}${counter}`;
          counter++;
          continue;
        }
      } catch (error) {
        // If Clerk check fails, continue to database check
      }
      
      // Check database (also enforces global uniqueness)
      const dbUser = await prisma.user.findUnique({ where: { username } });
      if (dbUser) {
        username = `${baseUsername}${counter}`;
        counter++;
      } else {
        usernameExists = false;
      }
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
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 }
    );
  }
}
