import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { adminInitiatePasswordRecoverySchema } from "@skill-learn/lib/zodSchemas";
import { initiateOutOfBandPasswordRecovery } from "@skill-learn/lib/utils/clerkPasswordRecovery";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import type { RouteContext } from "@/types";

type P = { tenantId: string; userId: string };

/**
 * POST /api/tenants/[tenantId]/users/[userId]/reset-password
 * [userId] is Clerk user id. Delivers an expiring Clerk sign-in link OOB; user must set a new password after signing in.
 */
export async function POST(request: NextRequest, { params }: RouteContext<P>) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId, userId: clerkId } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const dbUser = await prisma.user.findFirst({
      where: { clerkId, tenantId },
      select: { id: true, username: true },
    });
    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in this tenant." },
        { status: 404 }
      );
    }

    try {
      await validateRequestBody(request, adminInitiatePasswordRecoverySchema);
    } catch (err) {
      if (
        err instanceof SyntaxError ||
        (err instanceof Error && err.message.toLowerCase().includes("json"))
      ) {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
      }
      throw err;
    }

    const { expiresInSeconds, deliveryChannel } =
      await initiateOutOfBandPasswordRecovery(clerkId);

    return NextResponse.json({
      success: true,
      message:
        deliveryChannel === "email"
          ? "A secure sign-in link was sent to the user’s verified email."
          : "A secure sign-in link was sent by SMS to the user’s verified phone.",
      expiresInSeconds,
      deliveryChannel,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
