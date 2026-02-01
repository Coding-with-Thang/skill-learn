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
import { flashCardBulkImportSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";
import { computeFingerprint } from "@skill-learn/lib/utils/flashCardFingerprint.js";

/**
 * POST: Bulk import flash cards (CSV/JSON parsed client-side)
 */
export async function POST(req) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;
    const clerkId = adminResult;

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
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const data = await validateRequestBody(req, flashCardBulkImportSchema);

    const category = await prisma.flashCardCategory.findFirst({
      where: { id: data.categoryId, tenantId },
    });
    if (!category) {
      throw new AppError("Category not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const existingFingerprints = new Set(
      (
        await prisma.flashCard.findMany({
          where: { tenantId },
          select: { fingerprint: true },
        })
      ).map((c) => c.fingerprint)
    );

    let created = 0;
    let skipped = 0;

    for (const item of data.cards) {
      const fingerprint = computeFingerprint(item.question, item.answer);
      if (existingFingerprints.has(fingerprint)) {
        skipped++;
        continue;
      }

      try {
        await prisma.flashCard.create({
          data: {
            tenantId,
            categoryId: data.categoryId,
            question: item.question.trim(),
            answer: item.answer.trim(),
            fingerprint,
            createdBy: user.id,
            createdRole: "admin",
            tags: item.tags ?? [],
            difficulty: item.difficulty ?? null,
          },
        });
        existingFingerprints.add(fingerprint);
        created++;
      } catch (err) {
        if (err.code === "P2002") {
          skipped++;
        } else throw err;
      }
    }

    return successResponse({
      created,
      skipped,
      total: data.cards.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
