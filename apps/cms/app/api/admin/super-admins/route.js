import { NextResponse } from "next/server";
import { clerkClient } from '@clerk/nextjs/server';
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

// Ensure clerkClient is properly imported
if (!clerkClient) {
  console.error('clerkClient is not available');
}

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
      const client = typeof clerkClient === 'function' ? await clerkClient() : clerkClient;
      const result = await client.users.getUserList({
        limit: 500,
      });
      // getUserList returns an array directly
      clerkUsers = Array.isArray(result) ? result : (result.data || []);
    } catch (error) {
      console.error('Error getting users from Clerk:', error);
      throw error;
    }

    // Filter users with super admin role
    const superAdmins = clerkUsers
      .filter(user => {
        const role = user.publicMetadata?.role || user.publicMetadata?.appRole;
        return role === 'super_admin';
      })
      .map(user => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown',
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
