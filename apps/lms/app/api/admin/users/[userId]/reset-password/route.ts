import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { requirePermission } from "@skill-learn/lib/utils/permissions";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { logSecurityEvent } from "@skill-learn/lib/utils/security/logger";
import {
  SECURITY_EVENT_CATEGORIES,
  SECURITY_EVENT_TYPES,
} from "@skill-learn/lib/utils/security/eventTypes";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody, validateRequestParams } from "@skill-learn/lib/utils/validateRequest";
import { adminInitiatePasswordRecoverySchema, objectIdSchema } from "@skill-learn/lib/zodSchemas";
import { z } from "zod";
import type { RouteContext } from "@/types";
import { initiateOutOfBandPasswordRecovery } from "@skill-learn/lib/utils/clerkPasswordRecovery";

type Params = { userId: string };

export async function POST(request: NextRequest, { params }: RouteContext<Params>) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { userId: adminClerkId, tenantId, user: actorUser } = adminResult;

    const permResult = await requirePermission("users.update", tenantId);
    if (permResult instanceof NextResponse) {
      return permResult;
    }

    if (!tenantId) {
      throw new AppError("Tenant context required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const { userId } = await validateRequestParams(
      z.object({ userId: objectIdSchema }),
      params
    );

    await validateRequestBody(request, adminInitiatePasswordRecoverySchema);

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, clerkId: true, tenantId: true, username: true },
    });

    if (!target) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    if (target.tenantId !== tenantId) {
      throw new AppError(
        "Access denied: User does not belong to your organization",
        ErrorType.FORBIDDEN,
        { status: 403 }
      );
    }

    const { expiresInSeconds, deliveryChannel } =
      await initiateOutOfBandPasswordRecovery(target.clerkId);

    await logSecurityEvent({
      actorUserId: actorUser.id,
      actorClerkId: adminClerkId,
      tenantId,
      eventType: SECURITY_EVENT_TYPES.USER_PASSWORD_RESET_BY_ADMIN,
      category: SECURITY_EVENT_CATEGORIES.USER_MANAGEMENT,
      action: "password_recovery_oob",
      resource: "user",
      resourceId: target.id,
      severity: "high",
      message: `Out-of-band password recovery initiated for user: ${target.username}`,
      details: {
        targetUserId: target.id,
        targetClerkId: target.clerkId,
        deliveryChannel,
        expiresInSeconds,
      },
      request,
    });

    return successResponse({
      message:
        deliveryChannel === "email"
          ? "A secure sign-in link was sent to the user’s verified email. It expires when used or when the time limit is reached."
          : "A secure sign-in link was sent by SMS to the user’s verified phone. It expires when used or when the time limit is reached.",
      expiresInSeconds,
      deliveryChannel,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
