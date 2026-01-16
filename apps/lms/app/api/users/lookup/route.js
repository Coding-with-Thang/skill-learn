import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { clerkClient } from "@clerk/nextjs/server";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

/**
 * GET /api/users/lookup
 * Look up user email by username (for sign-in purposes)
 * This is a public endpoint used during authentication
 * 
 * If database is unavailable, falls back to using username directly with Clerk
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Check if database is available
    let user = null;
    let dbAvailable = true;

    try {
      // Find user by username in our database
      user = await prisma.user.findUnique({
        where: { username },
        select: {
          email: true,
          clerkId: true,
        },
      });
    } catch (dbError) {
      // Database connection error (e.g., MONGODB_URI not set)
      console.warn('Database unavailable, falling back to username authentication:', dbError.message);
      dbAvailable = false;
      
      // If database is not available, return username for direct Clerk authentication
      // Clerk supports username authentication without database lookup
      return successResponse({
        username: username,
        useEmail: false,
        fallback: true, // Indicates we're using fallback mode
      });
    }

    // If user not found in database, return error
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // If email exists in database, use it
    if (user.email) {
      return successResponse({
        email: user.email,
        clerkId: user.clerkId,
        useEmail: true,
      });
    }

    // If email is not in database, try to get it from Clerk
    try {
      const clerkUser = await clerkClient.users.getUser(user.clerkId);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      
      if (email) {
        // Update database with email for future lookups (only if DB is available)
        if (dbAvailable) {
          await prisma.user.update({
            where: { clerkId: user.clerkId },
            data: { email },
          }).catch(() => {
            // Ignore update errors - non-critical
          });
        }
        
        return successResponse({
          email: email,
          username: username,
          clerkId: user.clerkId,
          useEmail: true,
        });
      }
    } catch (clerkError) {
      console.error('Error fetching email from Clerk:', clerkError);
    }

    // If we still don't have email, return username for Clerk authentication
    // Clerk supports username authentication directly
    return successResponse({
      username: username,
      clerkId: user.clerkId,
      useEmail: false,
    });
  } catch (error) {
    // If all else fails, allow username authentication as fallback
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    
    if (username) {
      console.warn('Lookup failed, falling back to username authentication:', error.message);
      return successResponse({
        username: username,
        useEmail: false,
        fallback: true,
      });
    }
    
    return handleApiError(error);
  }
}
