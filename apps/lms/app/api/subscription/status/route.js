import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSubscriptionStatus } from "@/lib/subscription-guard";

/**
 * GET /api/subscription/status
 * Get the current user's subscription status and access level
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        isActive: false,
        needsOnboarding: true,
        message: "Not authenticated",
      });
    }

    const status = await getSubscriptionStatus(userId);

    return NextResponse.json({
      authenticated: true,
      ...status,
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}
