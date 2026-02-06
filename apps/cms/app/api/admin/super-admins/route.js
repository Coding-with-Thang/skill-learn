import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

/**
 * Get list of all super admins
 */
export async function GET(request) {
  try {
    // Check if requester is super admin
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    // Get all users from Clerk
    // In newer Clerk versions, clerkClient is a function that returns the client
    let clerkUsers;
    try {
      const client =
        typeof clerkClient === "function" ? await clerkClient() : clerkClient;
      const result = await client.users.getUserList({
        limit: 500,
      });
      // getUserList returns an array directly
      clerkUsers = Array.isArray(result) ? result : result.data || [];
    } catch (error) {
      console.error("Error getting users from Clerk:", error);
      throw error;
    }

    // Filter users with super admin role
    const superAdmins = clerkUsers
      .filter((user) => {
        const role = user.publicMetadata?.role || user.publicMetadata?.appRole;
        return role === "super_admin";
      })
      .map((user) => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        fullName:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.emailAddresses[0]?.emailAddress ||
          "Unknown",
        username: user.username,
        imageUrl: user.imageUrl,
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    return NextResponse.json({
      superAdmins,
      count: superAdmins.length,
    });
  } catch (error) {
    console.error("Error fetching super admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch super admins" },
      { status: 500 }
    );
  }
}

/**
 * Promote a user to super admin by email.
 * Only existing super admins can promote new super admins.
 * The user must already have a Clerk account (e.g. from LMS sign-up).
 */
export async function POST(request) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const client =
      typeof clerkClient === "function" ? await clerkClient() : clerkClient;
    const users = await client.users.getUserList({
      emailAddress: [trimmedEmail],
    });
    const clerkUsers = Array.isArray(users) ? users : users.data || [];

    if (clerkUsers.length === 0) {
      return NextResponse.json(
        {
          error:
            "User not found. The user must have an existing account (e.g. signed up via LMS).",
        },
        { status: 404 }
      );
    }

    const clerkUser = clerkUsers[0];
    const currentRole =
      clerkUser.publicMetadata?.role || clerkUser.publicMetadata?.appRole;

    if (currentRole === "super_admin") {
      return NextResponse.json(
        {
          message: "User already has super admin access",
          user: {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            name:
              `${clerkUser.firstName || ""} ${
                clerkUser.lastName || ""
              }`.trim() || clerkUser.emailAddresses[0]?.emailAddress,
          },
        },
        { status: 200 }
      );
    }

    await client.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        ...clerkUser.publicMetadata,
        role: "super_admin",
        appRole: "super_admin",
      },
    });

    await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {},
      create: {
        clerkId: clerkUser.id,
        username: clerkUser.username || clerkUser.id,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        imageUrl: clerkUser.imageUrl || null,
        points: 0,
        lifetimePoints: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "User promoted to super admin. They must sign out and sign back in to access the CMS.",
      user: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          clerkUser.emailAddresses[0]?.emailAddress,
      },
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
}
