import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimiter } from "@skill-learn/lib/utils/rateLimit";
import { publicRoutes, rateLimits } from "@/config/routes";

const isPublicRoute = createRouteMatcher(publicRoutes);

/**
 * Check if a route is in the (public) directory
 * Routes in app/(public)/ are automatically public and don't require authentication
 * This follows security best practices by making public routes explicit via folder structure
 *
 * @param {string} pathname - The request pathname
 * @returns {boolean} - True if the route is in (public) directory
 */
function isPublicDirectoryRoute(pathname) {
  // Routes that are in app/(public)/ directory
  // These patterns match the actual URL paths (route groups don't appear in URLs)
  const publicDirectoryPatterns = [
    /^\/about(\/.*)?$/, // /about
    /^\/changelog(\/.*)?$/, // /changelog, /changelog/slug, etc.
    /^\/contact(\/.*)?$/, // /contact
    /^\/features(\/.*)?$/, // /features
    /^\/legal(\/.*)?$/, // /legal, /legal/privacy-policy, etc.
    /^\/pricing(\/.*)?$/, // /pricing
    /^\/resources(\/.*)?$/, // /resources, /resources/case-studies/techflow, etc.
    /^\/sitemap(\/.*)?$/, // /sitemap
    /^\/support(\/.*)?$/, // /support, /support/faq, etc.
    /^\/careers(\/.*)?$/, // /careers, /careers/job-id, etc.
    /^\/video-ad(\/.*)?$/, // /video-ad
  ];

  return publicDirectoryPatterns.some((pattern) => pattern.test(pathname));
}

const proxy = clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();
    const { pathname } = req.nextUrl;

    // Handle redirects for landing page and home page
    // Redirect authenticated users from landing page (/) to home page (/home)
    if (userId && pathname === "/") {
      const homeUrl = new URL("/home", req.url);
      return NextResponse.redirect(homeUrl);
    }

    // Redirect unauthenticated users from home page (/home) to landing page (/)
    if (!userId && pathname === "/home") {
      const landingUrl = new URL("/", req.url);
      return NextResponse.redirect(landingUrl);
    }

    // Get IP address from headers (Edge runtime compatible)
    // req.ip is not available in Next.js proxy Edge runtime
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Check if route is public (either in publicRoutes config or in (public) directory)
    // Routes in app/(public)/ are automatically public - this follows security best practices
    // by making public routes explicit via folder structure
    const isPublic = isPublicRoute(req) || isPublicDirectoryRoute(pathname);
    const isProtected = !isPublic;

    // Apply rate limiting based on route type
    // Protected routes are strictly rate limited, public routes are more lenient
    const rateLimit = isProtected ? rateLimits.protected : rateLimits.public;
    const rateLimitResult = await rateLimiter(ip, rateLimit);

    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": rateLimitResult.retryAfter.toString(),
          },
        }
      );
    }

    // Check authentication for protected routes
    // Routes are protected if they're NOT in publicRoutes config AND NOT in app/(public)/ directory
    if (isProtected) {
      await auth.protect();
    }
  } catch (error) {
    // NEXT_REDIRECT is a special Next.js error used for redirects - don't treat it as an error
    if (error.message === "NEXT_REDIRECT") {
      throw error; // Re-throw to allow Next.js to handle the redirect
    }

    // NEXT_HTTP_ERROR_FALLBACK is used by Clerk for 404 errors when protect() is called
    // This happens when unauthenticated users try to access protected routes
    // We should let Next.js handle this, not treat it as a server error
    if (error.message?.includes("NEXT_HTTP_ERROR_FALLBACK")) {
      // Re-throw to let Next.js handle it properly (will return 404)
      throw error;
    }

    console.error("Proxy error:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Note: withAudit function has been moved to src/utils/withAudit.js
// It cannot run in proxy because it uses Prisma (Node.js runtime only)
// Use it in API routes instead

export default proxy;

export const config = {
  matcher: [
    //Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    //Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
