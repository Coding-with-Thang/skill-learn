import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user found" },
        { status: 401 }
      );
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
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
          message: "New user created",
          user: newUser,
        });
      } catch (createError) {
        console.error("Error creating user:", createError);
        return NextResponse.json(
          { error: "Failed to create user", details: createError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "User found",
      user: dbUser,
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
