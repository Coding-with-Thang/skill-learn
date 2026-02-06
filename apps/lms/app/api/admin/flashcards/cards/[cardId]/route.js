import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { flashCardUpdateSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";
import { computeFingerprint } from "@skill-learn/lib/utils/flashCardFingerprint.js";

async function getParams(context) {
  return await context.params;
}

/**
 * PUT: Update flash card (admin)
 */
export async function PUT(req, context) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const { cardId } = await getParams(context);
    const data = await validateRequestBody(req, flashCardUpdateSchema);

    const existing = await prisma.flashCard.findFirst({
      where: { id: cardId, tenantId },
    });
    if (!existing) {
      throw new AppError("Flash card not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const updateData = { ...data };
    if (data.question != null || data.answer != null) {
      const q = data.question ?? existing.question;
      const a = data.answer ?? existing.answer;
      updateData.fingerprint = computeFingerprint(q, a);
    }

    const card = await prisma.flashCard.update({
      where: { id: cardId },
      data: updateData,
      include: { category: { select: { id: true, name: true } } },
    });

    return successResponse({ card });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE: Delete flash card (admin)
 */
export async function DELETE(req, context) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const { cardId } = await getParams(context);

    const existing = await prisma.flashCard.findFirst({
      where: { id: cardId, tenantId },
    });
    if (!existing) {
      throw new AppError("Flash card not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    await prisma.flashCard.delete({ where: { id: cardId } });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
