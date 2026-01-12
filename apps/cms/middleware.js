import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  // Protect all /cms/* routes (except sign-in, sign-up, and pending-approval)
  // Note: setup-guide is now locked and only accessible to super admins
  if (
    pathname.startsWith("/cms") &&
    !pathname.startsWith("/cms/sign-in") &&
    !pathname.startsWith("/cms/sign-up") &&
    !pathname.startsWith("/cms/pending-approval")
  ) {
    if (!userId) {
      const signInUrl = new URL("/cms/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check super admin role from Clerk metadata
    // Note: If custom session token claims are configured in Clerk Dashboard,
    // the role will be available directly in sessionClaims.role or sessionClaims.appRole
    const userRole = 
      sessionClaims?.role ||                    // Custom session token claim (recommended)
      sessionClaims?.appRole ||                 // Custom session token claim (recommended)
      sessionClaims?.publicMetadata?.role ||    // Fallback: if publicMetadata is included
      sessionClaims?.publicMetadata?.appRole || // Fallback: if publicMetadata is included
      sessionClaims?.metadata?.role;            // Legacy fallback

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
});

export const config = {
  matcher: ["/((?!_next|_static|favicon.ico).*)", "/"],
};
