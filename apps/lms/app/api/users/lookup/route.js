import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { clerkClient } from "@clerk/nextjs/server";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

/**
 * GET /api/users/lookup
 * Look up user email/phone by username (for sign-in purposes)
 * This is a public endpoint used during authentication
 * 
 * Primary method: Search Clerk directly by username
 * Fallback: Check database if available (for caching)
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

    console.log(`[Lookup API] Searching for username: "${username}"`);

    // PRIMARY METHOD: Search Clerk directly by username
    // This is the most reliable method for username-based authentication
    try {
      const client = await clerkClient();
      if (!client || !client.users) {
        console.error('Clerk client is not available');
        return NextResponse.json(
          { error: "Authentication service unavailable. Please try again later." },
          { status: 503 }
        );
      }

      console.log(`[Lookup API] Searching Clerk for username: "${username}"`);
      const clerkUsers = await client.users.getUserList({
        username: [username],
        limit: 1,
      });
      
      console.log(`[Lookup API] Clerk search result:`, {
        hasData: !!clerkUsers?.data,
        dataLength: clerkUsers?.data?.length || 0,
        totalCount: clerkUsers?.totalCount || 0
      });
      
      if (clerkUsers && clerkUsers.data && clerkUsers.data.length > 0) {
        const clerkUser = clerkUsers.data[0];
        const email = clerkUser.emailAddresses?.[0]?.emailAddress;
        const phoneNumber = clerkUser.phoneNumbers?.[0]?.phoneNumber;
        
        // Clerk requires email or phone number for authentication
        const identifier = email || phoneNumber;
        
        if (identifier) {
          console.log(`[Lookup API] ✅ Found user "${username}" in Clerk with identifier: ${identifier}`);
          
          // Note: We don't update the database here since email field might not exist in schema
          // The database will be synced via Clerk webhooks if configured
          
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
          console.log(`[Lookup API] ⚠️ User "${username}" found in Clerk but has no email or phone`);
          console.log(`[Lookup API] Returning username as identifier (tenant may have username-only auth enabled)`);
          
          return successResponse({
            username: username,
            clerkId: clerkUser.id,
            identifier: username, // Return username as identifier for username-only auth
            useUsername: true, // Flag to indicate username-only authentication
            requiresEmail: false, // Indicates this tenant doesn't require email
          });
        }
      } else {
        console.log(`[Lookup API] No users found in Clerk with exact username: "${username}"`);
        
        // Try using query parameter for partial/fuzzy matching
        console.log(`[Lookup API] Trying query search as fallback...`);
        try {
          const queryResult = await client.users.getUserList({
            query: username,
            limit: 5, // Get a few results to check
          });
          
          console.log(`[Lookup API] Query search result:`, {
            hasData: !!queryResult?.data,
            dataLength: queryResult?.data?.length || 0
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
                console.log(`[Lookup API] ✅ Found user via query search with identifier: ${identifier}`);
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
          console.error('[Lookup API] Query search also failed:', queryError);
        }
      }
    } catch (clerkSearchError) {
      console.error('[Lookup API] ❌ Error searching Clerk users by username:', clerkSearchError);
      
      // Check if it's a Clerk authentication error
      if (clerkSearchError.message?.includes('key') || clerkSearchError.message?.includes('environment')) {
        console.error('[Lookup API] Clerk authentication error - check environment variables');
        return NextResponse.json(
          { error: "Authentication service configuration error. Please contact support." },
          { status: 503 }
        );
      }
      
      // For other Clerk errors, continue to fallback (database check)
    }

    // FALLBACK: Check database if available (optional, for users already in DB)
    try {
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          clerkId: true,
        },
      });
      
      if (user && user.clerkId) {
        console.log(`[Lookup API] Found user in database, fetching from Clerk by clerkId...`);
        
        try {
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(user.clerkId);
          const email = clerkUser.emailAddresses?.[0]?.emailAddress;
          const phoneNumber = clerkUser.phoneNumbers?.[0]?.phoneNumber;
          
          const identifier = email || phoneNumber;
          
          if (identifier) {
            console.log(`[Lookup API] ✅ Found identifier from Clerk via clerkId: ${identifier}`);
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
          console.error('[Lookup API] Error fetching from Clerk by clerkId:', clerkError);
          // If clerkId is invalid, the user might have been deleted from Clerk
          // or the clerkId in database is stale - skip this fallback
          console.log(`[Lookup API] Invalid clerkId in database, skipping fallback`);
        }
      } else {
        console.log(`[Lookup API] User not found in database`);
      }
    } catch (dbError) {
      // Database unavailable - this is okay, we already tried Clerk first
      console.log('[Lookup API] Database check skipped (unavailable)');
    }

    // User not found in Clerk
    console.log(`[Lookup API] ❌ User "${username}" not found in Clerk`);
    console.log(`[Lookup API] Troubleshooting: Check if username "${username}" is set in Clerk Dashboard`);
    return NextResponse.json(
      { 
        error: `User "${username}" not found. Please verify your username is correct, or sign in with your email address instead.` 
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('[Lookup API] Unexpected error:', error);
    return handleApiError(error);
  }
}
