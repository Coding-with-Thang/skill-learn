import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * API route to check if user is super admin
 * This can be called from client-side to verify access
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { isSuperAdmin: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch user from Clerk API to get publicMetadata
    const user = await clerkClient.users.getUser(userId);
    const userRole = 
      user.publicMetadata?.role ||
      user.publicMetadata?.appRole;

    const isSuperAdmin = userRole === 'super_admin';

    return NextResponse.json({
      isSuperAdmin,
      userRole,
      publicMetadata: user.publicMetadata,
    });
  } catch (error) {
    console.error("[check-super-admin] Error:", error);
    return NextResponse.json(
      { isSuperAdmin: false, error: error.message },
      { status: 500 }
    );
  }
}
