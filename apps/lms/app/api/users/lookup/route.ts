import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { clerkClient } from "@clerk/nextjs/server";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

/**
 * GET /api/users/lookup
 * Look up user email/phone by username (for sign-in purposes)
 * This is a public endpoint used during authentication
 * 
 * Primary method: Search Clerk directly by username
 * Fallback: Check database if available (for caching)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // PRIMARY METHOD: Search Clerk directly by username
    // This is the most reliable method for username-based authentication
    try {
      const client = await clerkClient();
      if (!client || !client.users) {
        return NextResponse.json(
          { error: "Authentication service unavailable. Please try again later." },
          { status: 503 }
        );
      }

      const clerkUsers = await client.users.getUserList({
        username: [username],
        limit: 1,
      });
      
      if (clerkUsers && clerkUsers.data && clerkUsers.data.length > 0) {
        const clerkUser = clerkUsers.data[0];
        const email = clerkUser.emailAddresses?.[0]?.emailAddress;
        const phoneNumber = clerkUser.phoneNumbers?.[0]?.phoneNumber;
        
        // Clerk requires email or phone number for authentication
        const identifier = email || phoneNumber;
        
        if (identifier) {
          return successResponse({
            email: email || undefined,
            phoneNumber: phoneNumber || undefined,
            identifier: identifier,
            username: username,
            clerkId: clerkUser.id,
            useEmail: !!email,
          });
        } else {
          // WORKAROUND: If user has no email/phone, return username as identifier
          // This allows tenants that have username authentication enabled in Clerk to work
          return successResponse({
            username: username,
            clerkId: clerkUser.id,
            identifier: username, // Return username as identifier for username-only auth
            useUsername: true, // Flag to indicate username-only authentication
            requiresEmail: false, // Indicates this tenant doesn't require email
          });
        }
      } else {
        // Try using query parameter for partial/fuzzy matching
        try {
          const queryResult = await client.users.getUserList({
            query: username,
            limit: 5,
          });
          
          // Check if any result matches the username exactly
          if (queryResult?.data && queryResult.data.length > 0) {
            const exactMatch = queryResult.data.find(u => 
              u.username === username || 
              u.username?.toLowerCase() === username.toLowerCase()
            );
            
            if (exactMatch) {
              const email = exactMatch.emailAddresses?.[0]?.emailAddress;
              const phoneNumber = exactMatch.phoneNumbers?.[0]?.phoneNumber;
              const identifier = email || phoneNumber;
              
              if (identifier) {
                return successResponse({
                  email: email || undefined,
                  phoneNumber: phoneNumber || undefined,
                  identifier: identifier,
                  username: username,
                  clerkId: exactMatch.id,
                  useEmail: !!email,
                });
              }
            }
          }
        } catch (queryError) {
          // Query search failed, continue to fallback
        }
      }
    } catch (clerkSearchError) {
      // Check if it's a Clerk authentication error
      if (clerkSearchError.message?.includes('key') || clerkSearchError.message?.includes('environment')) {
        return NextResponse.json(
          { error: "Authentication service configuration error. Please contact support." },
          { status: 503 }
        );
      }
      
      // For other Clerk errors, continue to fallback (database check)
    }

    // FALLBACK: Check database if available (optional, for users already in DB)
    // Usernames are globally unique, so findUnique will work correctly
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          clerkId: true,
        },
      });
      
      if (user && user.clerkId) {
        try {
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(user.clerkId);
          const email = clerkUser.emailAddresses?.[0]?.emailAddress;
          const phoneNumber = clerkUser.phoneNumbers?.[0]?.phoneNumber;
          
          const identifier = email || phoneNumber;
          
          if (identifier) {
            return successResponse({
              email: email || undefined,
              phoneNumber: phoneNumber || undefined,
              identifier: identifier,
              username: username,
              clerkId: user.clerkId,
              useEmail: !!email,
            });
          }
        } catch (clerkError) {
          // If clerkId is invalid, the user might have been deleted from Clerk
          // or the clerkId in database is stale - skip this fallback
        }
      }
    } catch (dbError) {
      // Database unavailable - this is okay, we already tried Clerk first
    }

    // User not found in Clerk
    return NextResponse.json(
      { 
        error: `User "${username}" not found. Please verify your username is correct, or sign in with your email address instead.` 
      },
      { status: 404 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
