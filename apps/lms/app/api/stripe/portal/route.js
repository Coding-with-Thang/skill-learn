import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { createPortalSession } from "@/lib/stripe";

/**
 * POST /api/stripe/portal
 * Create a Stripe billing portal session
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new AppError("Unauthorized", ErrorType.AUTH, { status: 401 });
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
      throw new AppError("No billing account found. Please subscribe to a plan first.", ErrorType.VALIDATION, { status: 400 });
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
    return handleApiError(error);
  }
}
