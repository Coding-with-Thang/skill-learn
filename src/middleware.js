import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimiter } from "@/utils/rateLimit";
import { protectedRoutes, rateLimits } from "@/config/routes";

const isProtectedRoute = createRouteMatcher(protectedRoutes);

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();
    const { pathname } = req.nextUrl;

    // Handle redirects for landing page and home page
    // Redirect authenticated users from landing page (/) to home page (/home)
    if (userId && pathname === '/') {
      const homeUrl = new URL('/home', req.url);
      return NextResponse.redirect(homeUrl);
    }

    // Redirect unauthenticated users from home page (/home) to landing page (/)
    if (!userId && pathname === '/home') {
      const landingUrl = new URL('/', req.url);
      return NextResponse.redirect(landingUrl);
    }

    // Get IP address from headers (Edge runtime compatible)
    // req.ip is not available in Next.js middleware Edge runtime
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";

    // Apply rate limiting based on route type
    const rateLimit = isProtectedRoute(req)
      ? rateLimits.protected
      : rateLimits.public;
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
    if (!userId && isProtectedRoute(req)) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized - Please sign in" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Middleware error:", {
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
// It cannot be in middleware because it uses Prisma (Node.js runtime only)
// Use it in API routes instead

export const config = {
  matcher: [
    //Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    //Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
