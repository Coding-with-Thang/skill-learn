import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { rateLimiter } from "../../packages/lib/utils/rateLimit";
import { publicRoutes, rateLimits } from "@/config/routes";
import { routing } from "./i18n/routing";

// Match pathnames with locale prefix (e.g. /en/sign-in)
const localePrefix = `/(${routing.locales.join("|")})`;
const publicRoutesWithLocale = [
  localePrefix, // /en or /fr (landing)
  ...publicRoutes.filter((r) => r !== "/").map((r) => `${localePrefix}${r}`),
];
const isPublicRoute = createRouteMatcher(publicRoutesWithLocale);
const intlMiddleware = createIntlMiddleware(routing);

/**
 * Strip locale prefix (e.g. /en, /fr) from pathname for route matching.
 */
function getPathnameWithoutLocale(pathname: string): string {
  const withoutLocale = pathname.replace(/^\/(en|fr)(?=\/|$)/, "") || "/";
  return withoutLocale;
}

/**
 * Get locale from pathname (en or fr), default en.
 */
function getLocaleFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(en|fr)(?=\/|$)/);
  return match?.[1] ?? "en";
}

/**
 * Check if a route is in the (public) directory
 * Routes in app/(public)/ are automatically public and don't require authentication
 * This follows security best practices by making public routes explicit via folder structure
 *
 * @param {string} pathname - The request pathname (without locale prefix)
 * @returns {boolean} - True if the route is in (public) directory
 */
function isPublicDirectoryRoute(pathname: string) {
  const publicDirectoryPatterns = [
    /^\/about(\/.*)?$/,
    /^\/changelog(\/.*)?$/,
    /^\/contact(\/.*)?$/,
    /^\/features(\/.*)?$/,
    /^\/legal(\/.*)?$/,
    /^\/pricing(\/.*)?$/,
    /^\/resources(\/.*)?$/,
    /^\/sitemap(\/.*)?$/,
    /^\/support(\/.*)?$/,
    /^\/careers(\/.*)?$/,
    /^\/video-ad(\/.*)?$/,
  ];
  return publicDirectoryPatterns.some((pattern) => pattern.test(pathname));
}

const proxy = clerkMiddleware(async (auth, req) => {
  try {
    // Run next-intl first (locale redirects, e.g. / -> /en)
    const intlResponse = await intlMiddleware(req);
    if (intlResponse && intlResponse.status >= 300 && intlResponse.status < 400) {
      return intlResponse;
    }

    const { userId } = await auth();
    const { pathname } = req.nextUrl;
    const pathWithoutLocale = getPathnameWithoutLocale(pathname);
    const locale = getLocaleFromPathname(pathname);

    // Handle redirects for landing page and home page (locale-aware)
    if (userId && (pathWithoutLocale === "/" || pathWithoutLocale === "")) {
      const homeUrl = new URL(`/${locale}/home`, req.url);
      return NextResponse.redirect(homeUrl);
    }
    if (!userId && pathWithoutLocale === "/home") {
      const landingUrl = new URL(`/${locale}`, req.url);
      return NextResponse.redirect(landingUrl);
    }

    // Get IP address from headers (Edge runtime compatible)
    // req.ip is not available in Next.js proxy Edge runtime
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Check if route is public (pathname has locale prefix; match without it for (public) dir)
    const isPublic =
      isPublicRoute(req) || isPublicDirectoryRoute(pathWithoutLocale);
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
    if (isProtected) {
      await auth.protect();
    }

    // Return intl response when no redirect so locale headers are preserved
    return intlResponse ?? NextResponse.next();
  } catch (err) {
    // NEXT_REDIRECT is a special Next.js error used for redirects - don't treat it as an error
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err; // Re-throw to allow Next.js to handle the redirect
    }

    // NEXT_HTTP_ERROR_FALLBACK is used by Clerk for 404 errors when protect() is called
    // This happens when unauthenticated users try to access protected routes
    // We should let Next.js handle this, not treat it as a server error
    if (err instanceof Error && err.message?.includes("NEXT_HTTP_ERROR_FALLBACK")) {
      // Re-throw to let Next.js handle it properly (will return 404)
      throw err;
    }

    const e = err instanceof Error ? err : new Error(String(err));
    console.error("Proxy error:", {
      message: e.message,
      stack: e.stack,
      type: e.constructor.name,
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
