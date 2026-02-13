import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { flashCardUpdateSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import { computeFingerprint } from "@skill-learn/lib/utils/flashCardFingerprint";
import type { RouteContext } from "@/types";

type CardIdParams = { cardId: string };

/**
 * PUT: Update flash card (admin)
 */
export async function PUT(
  req: NextRequest,
  { params }: RouteContext<CardIdParams>
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const { cardId } = await params;
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
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext<CardIdParams>
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const { cardId } = await params;

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
