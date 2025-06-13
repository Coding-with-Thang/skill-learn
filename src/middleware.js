import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimiter } from "@/middleware/rateLimit";
import { protectedRoutes, rateLimits } from "@/config/routes";

const isProtectedRoute = createRouteMatcher(protectedRoutes);

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();

    // Apply rate limiting based on route type
    const rateLimit = isProtectedRoute(req)
      ? rateLimits.protected
      : rateLimits.public;
    const rateLimitResult = await rateLimiter(req.ip, rateLimit);

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
    console.log("user id:", userId);
    // Check authentication for protected routes
    if (!userId && isProtectedRoute(req)) {
      console.log("Middleware - Unauthorized access to protected route");
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

export const config = {
  matcher: [
    //Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    //Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
