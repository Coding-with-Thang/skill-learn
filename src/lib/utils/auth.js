import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";

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
 * Require admin (OPERATIONS) role for API routes
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

  // Verify admin role
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "OPERATIONS") {
    return NextResponse.json(
      { error: "Unauthorized - Requires OPERATIONS role" },
      { status: 403 }
    );
  }

  return { userId, user };
}

/**
 * Require admin (OPERATIONS) role for server actions
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

  if (!user || user.role !== "OPERATIONS") {
    throw new Error("Unauthorized - Requires OPERATIONS role");
  }

  return { userId, user };
}

