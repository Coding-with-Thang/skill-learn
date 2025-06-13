import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimiter } from "@/middleware/rateLimit";
import { protectedRoutes, rateLimits } from "@/config/routes";
import { auditActions } from "@/utils/auditLogger";

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

export function withAudit(handler, options = {}) {
  return async (req, res) => {
    const startTime = Date.now();

    try {
      // Execute the original handler
      const result = await handler(req, res);

      // Log successful actions if configured
      if (options.logSuccess && req.user?.id) {
        const duration = Date.now() - startTime;
        await logAuditEvent(
          req.user.id,
          options.action || req.method.toLowerCase(),
          options.resource || "api",
          options.resourceId,
          `API call: ${req.url} (${duration}ms)`
        );
      }

      return result;
    } catch (error) {
      // Log failed actions
      if (options.logErrors && req.user?.id) {
        await logAuditEvent(
          req.user.id,
          "error",
          options.resource || "api",
          options.resourceId,
          `API error: ${req.url} - ${error.message}`
        );
      }
      throw error;
    }
  };
}
export const config = {
  matcher: [
    //Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    //Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
