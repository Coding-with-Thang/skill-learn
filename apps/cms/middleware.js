import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  // Protect all /cms/* routes
  if (pathname.startsWith('/cms')) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check super admin role from Clerk metadata
    const userRole = sessionClaims?.metadata?.role || sessionClaims?.publicMetadata?.role;
    const isSuperAdmin = userRole === 'super_admin';

    if (!isSuperAdmin) {
      // Optional: Check database as fallback
      // const { prisma } = await import('@skill-learn/database');
      // const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      // if (user?.role !== 'SUPER_ADMIN') {
      //   return NextResponse.redirect(new URL('/', req.url), { status: 403 });
      // }
      
      // For now, just redirect non-admins
      return NextResponse.redirect(new URL('/', req.url), {
        status: 403
      });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|_static|favicon.ico).*)",
    "/",
  ],
};
