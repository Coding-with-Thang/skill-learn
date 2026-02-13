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
import { flashCardProgressSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import {
  computeSm2Update,
  feedbackToQuality,
} from "@skill-learn/lib/utils/sm2";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { flashCardId, feedback } = await validateRequestBody(
      req,
      flashCardProgressSchema
    );

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

    const userId = user.id;

    // Verify user has access to this card (owned or shared)
    const card = await prisma.flashCard.findFirst({
      where: {
        id: flashCardId,
        tenantId,
        OR: [
          { createdBy: userId },
          {
            access: {
              some: { userId },
            },
          },
        ],
      },
    });

    if (!card) {
      throw new AppError("Flash card not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const quality = feedbackToQuality(feedback);

    const existing = await prisma.flashCardProgress.findUnique({
      where: {
        tenantId_userId_flashCardId: {
          tenantId,
          userId,
          flashCardId,
        },
      },
    });

    const sm2 = computeSm2Update(existing, quality);
    const now = new Date();
    const exposureCount = (existing?.exposureCount ?? 0) + 1;
    const correctCount =
      (existing?.correctCount ?? 0) + (quality >= 3 ? 1 : 0);
    const incorrectCount =
      (existing?.incorrectCount ?? 0) + (quality < 3 ? 1 : 0);
    const masteryScore =
      exposureCount > 0 ? correctCount / exposureCount : 0;

    await prisma.flashCardProgress.upsert({
      where: {
        tenantId_userId_flashCardId: {
          tenantId,
          userId,
          flashCardId,
        },
      },
      create: {
        tenantId,
        userId,
        flashCardId,
        exposureCount,
        correctCount,
        incorrectCount,
        masteryScore,
        repetitions: sm2.repetitions,
        intervalDays: sm2.intervalDays,
        easeFactor: sm2.easeFactor,
        nextReviewAt: sm2.nextReviewAt,
        lastSeenAt: now,
      },
      update: {
        exposureCount,
        correctCount,
        incorrectCount,
        masteryScore,
        repetitions: sm2.repetitions,
        intervalDays: sm2.intervalDays,
        easeFactor: sm2.easeFactor,
        nextReviewAt: sm2.nextReviewAt,
        lastSeenAt: now,
      },
    });

    return successResponse({
      masteryScore,
      nextReviewAt: sm2.nextReviewAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
