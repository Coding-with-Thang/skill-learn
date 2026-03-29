import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { adminInitiatePasswordRecoverySchema } from "@skill-learn/lib/zodSchemas";
import { initiateOutOfBandPasswordRecovery } from "@skill-learn/lib/utils/clerkPasswordRecovery";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import type { RouteContext } from "@/types";

type P = { clerkUserId: string };

function isSuperAdminRole(meta: Record<string, unknown> | undefined): boolean {
  const role = meta?.role || meta?.appRole;
  return role === "super_admin";
}

/**
 * POST /api/admin/super-admins/[clerkUserId]/reset-password
 * Target must already be a super admin in Clerk publicMetadata.
 */
export async function POST(request: NextRequest, { params }: RouteContext<P>) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { clerkUserId } = await params;
    if (!clerkUserId?.trim()) {
      return NextResponse.json({ error: "User id required." }, { status: 400 });
    }

    const client =
      typeof clerkClient === "function" ? await clerkClient() : clerkClient;
    const target = await client.users.getUser(clerkUserId);
    const meta = target.publicMetadata as Record<string, unknown> | undefined;
    if (!isSuperAdminRole(meta)) {
      return NextResponse.json(
        { error: "User is not a super administrator." },
        { status: 400 }
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
      await initiateOutOfBandPasswordRecovery(clerkUserId);

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
