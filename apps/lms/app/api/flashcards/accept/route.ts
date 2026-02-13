import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { flashCardAcceptSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import { computeFingerprint } from "@skill-learn/lib/utils/flashCardFingerprint";

/**
 * Accept a shared flash card (no duplication - checks fingerprint)
 * If user already has card with same fingerprint, skip adding access
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { flashCardId } = await validateRequestBody(req, flashCardAcceptSchema);

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const card = await prisma.flashCard.findFirst({
      where: { id: flashCardId, tenantId, isPublic: true },
    });

    if (!card) {
      throw new AppError("Flash card not found or not shared", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    if (card.createdBy === user.id) {
      return successResponse({ accepted: false, reason: "already_owned" });
    }

    const fingerprint = card.fingerprint;

    const existingOwned = await prisma.flashCard.findFirst({
      where: {
        tenantId,
        createdBy: user.id,
        fingerprint,
      },
    });
    if (existingOwned) {
      return successResponse({ accepted: false, reason: "duplicate" });
    }

    const existingAccess = await prisma.flashCardAccess.findUnique({
      where: {
        flashCardId_userId: { flashCardId, userId: user.id },
      },
    });
    if (existingAccess) {
      return successResponse({ accepted: true, reason: "already_accepted" });
    }

    await prisma.flashCardAccess.create({
      data: {
        tenantId,
        flashCardId,
        userId: user.id,
      },
    });

    return successResponse({ accepted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
