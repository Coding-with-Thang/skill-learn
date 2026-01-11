import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';

/**
 * Require authentication for API routes
 * @returns {Promise<string>} The authenticated user's Clerk ID
 * @returns {NextResponse|null} Returns 401 Unauthorized response if not authenticated, null if authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return userId;
}

/**
 * Require admin (OPERATIONS or MANAGER) role for API routes
 * @returns {Promise<{userId: string, user: object}|null>} The authenticated user's Clerk ID and user record, or null if not authorized
 * @returns {NextResponse|null} Returns 401 Unauthorized or 403 Forbidden response if not authorized, null if authorized
 */
export async function requireAdmin() {
  const authResult = await requireAuth();
  
  // If requireAuth returned a NextResponse (error), return it
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const userId = authResult;

  // Verify admin role (OPERATIONS or MANAGER)
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!user || (user.role !== "OPERATIONS" && user.role !== "MANAGER")) {
    return NextResponse.json(
      { error: "Unauthorized - Requires OPERATIONS or MANAGER role" },
      { status: 403 }
    );
  }

  return { userId, user };
}

/**
 * Require admin (OPERATIONS or MANAGER) role for server actions
 * Throws Error if not authorized (for server actions that can't return NextResponse)
 * @returns {Promise<{userId: string, user: object}>} The authenticated user's Clerk ID and user record
 * @throws {Error} If not authenticated or not admin
 */
export async function requireAdminForAction() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!user || (user.role !== "OPERATIONS" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized - Requires OPERATIONS or MANAGER role");
  }

  return { userId, user };
}

/**
 * Require super admin role for CMS API routes
 * Checks Clerk metadata for 'super_admin' role
 * @returns {Promise<{userId: string}|null>} The authenticated user's Clerk ID, or null if not authorized
 * @returns {NextResponse|null} Returns 401 Unauthorized or 403 Forbidden response if not authorized, null if authorized
 */
export async function requireSuperAdmin() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check super admin role from Clerk metadata
  const userRole = sessionClaims?.metadata?.role || sessionClaims?.publicMetadata?.role;
  const isSuperAdmin = userRole === 'super_admin';

  if (!isSuperAdmin) {
    // Optional: Check database as fallback (if you store super_admin in User model)
    // const user = await prisma.user.findUnique({
    //   where: { clerkId: userId },
    //   select: { id: true, role: true },
    // });
    // 
    // if (!user || user.role !== 'SUPER_ADMIN') {
    //   return NextResponse.json(
    //     { error: "Unauthorized - Requires super admin access" },
    //     { status: 403 }
    //   );
    // }

    return NextResponse.json(
      { error: "Unauthorized - Requires super admin access" },
      { status: 403 }
    );
  }

  return { userId };
}

