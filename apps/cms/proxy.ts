import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const proxy = clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip proxy for static assets and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_static") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api/public") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Redirect sign-up to sign-in (no self-registration for CMS; super admins are created from within CMS)
  if (pathname.startsWith("/cms/sign-up")) {
    return NextResponse.redirect(new URL("/cms/sign-in", req.url));
  }

  // Allow public routes to pass through without authentication checks
  const isPublicRoute = pathname.startsWith("/cms/sign-in");

  // If it's a public route, allow it to pass through
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, try to authenticate
  try {
    const { userId, sessionClaims } = await auth();

    // Protect all /cms/* routes (except sign-in)
    // Note: setup-guide is now locked and only accessible to super admins
    if (pathname.startsWith("/cms")) {
      if (!userId) {
        const signInUrl = new URL("/cms/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Check super admin role from Clerk metadata
      // Note: If custom session token claims are configured in Clerk Dashboard,
      // the role will be available directly in sessionClaims.role or sessionClaims.appRole
      const claims = sessionClaims as Record<string, unknown> | undefined
      const publicMeta = claims?.publicMetadata as Record<string, unknown> | undefined
      const meta = claims?.metadata as Record<string, unknown> | undefined
      const userRole =
        claims?.role || // Custom session token claim (recommended)
        claims?.appRole || // Custom session token claim (recommended)
        publicMeta?.role || // Fallback: if publicMetadata is included
        publicMeta?.appRole || // Fallback: if publicMetadata is included
        meta?.role; // Legacy fallback

      const isSuperAdmin = userRole === "super_admin";

      if (!isSuperAdmin) {
        // For API routes, return JSON error
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            {
              error: "Forbidden",
              message: "Super admin access required",
              help: "Contact an existing super administrator to request access.",
            },
            { status: 403 }
          );
        }

        // For page routes, redirect to sign-in with error message
        const signInUrl = new URL("/cms/sign-in", req.url);
        signInUrl.searchParams.set("error", "access_denied");
        return NextResponse.redirect(signInUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If authentication fails (e.g., missing Clerk env vars), log the error
    // and allow public routes to pass through, but redirect protected routes
    console.error("Proxy authentication error:", error);

    // If it's a CMS route and not public, redirect to sign-in
    if (pathname.startsWith("/cms") && !isPublicRoute) {
      const signInUrl = new URL("/cms/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // For all other routes or if it's a public route, allow it to pass through
    return NextResponse.next();
  }
});

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (static assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
