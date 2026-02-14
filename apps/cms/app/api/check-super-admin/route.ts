import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * API route to check if user is super admin
 * This can be called from client-side to verify access
 * 
 * Super admin is stored in Clerk's publicMetadata.role = "super_admin"
 * This is set in Clerk Dashboard → Users → Metadata → Public Metadata
 */
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json(
        { isSuperAdmin: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check super admin role from session claims (more efficient than API call)
    // Note: If custom session token claims are configured in Clerk Dashboard,
    // the role will be available directly in sessionClaims.role or sessionClaims.appRole
    // Otherwise, it might be in sessionClaims.publicMetadata.role
    const pub = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
    const meta = sessionClaims?.metadata as Record<string, unknown> | undefined;
    const userRole =
      (sessionClaims as Record<string, unknown>)?.role ||
      (sessionClaims as Record<string, unknown>)?.appRole ||
      pub?.role ||
      pub?.appRole ||
      meta?.role;

    const isSuperAdmin = userRole === 'super_admin';

    return NextResponse.json({
      isSuperAdmin,
      userRole: userRole || null,
      userId,
      publicMetadata: sessionClaims?.publicMetadata || {},
    });
  } catch (error) {
    console.error("[check-super-admin] Error:", error);
    return NextResponse.json(
      { isSuperAdmin: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
