import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";

/**
 * GET /api/public/auth-settings
 * Returns auth settings for the sign-up page (e.g. whether email is required).
 * Optional query: ?tenant=slug — when provided, returns that tenant's requireEmailForRegistration.
 * When no tenant is provided, returns requireEmail: true (default).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get("tenant");

    if (!tenantSlug) {
      // No tenant context: use app default (email required)
      const envRequireEmail = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_FOR_SIGNUP;
      const requireEmail = envRequireEmail === "false" ? false : true;
      return NextResponse.json({ requireEmail });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { requireEmailForRegistration: true },
    });

    if (!tenant) {
      // Unknown tenant slug: default to email required
      return NextResponse.json({ requireEmail: true });
    }

    const requireEmail = tenant.requireEmailForRegistration !== false;
    return NextResponse.json({ requireEmail });
  } catch (error) {
    console.error("[auth-settings]", error);
    return NextResponse.json(
      { requireEmail: true },
      { status: 200 }
    );
  }
}
