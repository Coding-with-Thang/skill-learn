import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { createPortalSession } from "@/lib/stripe";

/**
 * POST /api/stripe/portal
 * Create a Stripe billing portal session
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user's tenant
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { 
        tenantId: true,
        tenant: {
          select: {
            stripeCustomerId: true,
          }
        }
      },
    });
    
    if (!user?.tenant?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe to a plan first." },
        { status: 400 }
      );
    }
    
    // Determine return URL
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;
    const { returnUrl } = await request.json().catch(() => ({}));
    const actualReturnUrl = returnUrl || `${origin}/dashboard/settings/billing`;
    
    // Create portal session
    const session = await createPortalSession({
      customerId: user.tenant.stripeCustomerId,
      returnUrl: actualReturnUrl,
    });
    
    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}
