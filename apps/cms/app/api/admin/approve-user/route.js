import { NextResponse } from "next/server";
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@skill-learn/database';
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

/**
 * Approve a user for super admin access
 * Only existing super admins can approve new super admins
 */
export async function POST(request) {
  try {
    // Check if requester is super admin
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await request.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: "Either userId or email is required" },
        { status: 400 }
      );
    }

    // Find user in Clerk
    let clerkUser;
    if (userId) {
      try {
        clerkUser = await clerkClient.users.getUser(userId);
      } catch (error) {
        return NextResponse.json(
          { error: "User not found in Clerk" },
          { status: 404 }
        );
      }
    } else if (email) {
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
      });
      if (users.length === 0) {
        return NextResponse.json(
          { error: "User not found in Clerk" },
          { status: 404 }
        );
      }
      clerkUser = users[0];
    }

    // Check if user already has super admin role
    const currentRole = clerkUser.publicMetadata?.role || clerkUser.publicMetadata?.appRole;
    if (currentRole === 'super_admin') {
      return NextResponse.json(
        { 
          message: "User already has super admin access",
          user: {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            name: `${clerkUser.firstName} ${clerkUser.lastName}`,
          }
        },
        { status: 200 }
      );
    }

    // Promote user to super admin
    await clerkClient.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        ...clerkUser.publicMetadata,
        role: 'super_admin',
        appRole: 'super_admin',
      },
    });

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {
        // User data will be synced by webhook
      },
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
      message: "User approved for super admin access",
      user: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      },
    });
  } catch (error) {
    console.error("Error approving user:", error);
    return NextResponse.json(
      { error: "Failed to approve user" },
      { status: 500 }
    );
  }
}

/**
 * Get list of users pending approval (users without super_admin role)
 */
export async function GET(request) {
  try {
    // Check if requester is super admin
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    // Get all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList({
      limit: 100, // Adjust as needed
    });

    // Filter users without super admin role
    const pendingUsers = clerkUsers
      .filter(user => {
        const role = user.publicMetadata?.role || user.publicMetadata?.appRole;
        return role !== 'super_admin';
      })
      .map(user => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      }));

    return NextResponse.json({
      users: pendingUsers,
      count: pendingUsers.length,
    });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending users" },
      { status: 500 }
    );
  }
}
