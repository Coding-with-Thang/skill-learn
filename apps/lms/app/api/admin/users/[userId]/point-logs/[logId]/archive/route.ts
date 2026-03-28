import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { adminPointLogArchived } from "@skill-learn/lib/utils/auditLogger";
import { objectIdSchema } from "@skill-learn/lib/zodSchemas";
import { z } from "zod";

type Params = { params: Promise<{ userId: string; logId: string }> };

const bodySchema = z.object({
  reason: z.string().trim().min(1, "Reason is required"),
});

function shouldAdjustLifetimeForRemovedLog(amount: number, reason: string) {
  if (amount <= 0) return false;
  return !reason.startsWith("progress_reset");
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId, userId: adminClerkId } = adminResult;
    if (!tenantId) {
      throw new AppError("Tenant context required", ErrorType.VALIDATION, { status: 400 });
    }

    const { userId, logId } = await z
      .object({
        userId: objectIdSchema,
        logId: objectIdSchema,
      })
      .parseAsync(await params);

    const json = await request.json().catch(() => ({}));
    const { reason: adminReason } = bodySchema.parse(json);

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, tenantId: true, points: true, lifetimePoints: true },
    });
    if (!targetUser) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    if (targetUser.tenantId !== tenantId) {
      throw new AppError("User not in your tenant", ErrorType.FORBIDDEN, { status: 403 });
    }

    const log = await prisma.pointLog.findFirst({
      where: { id: logId, userId },
      select: { id: true, amount: true, reason: true, createdAt: true },
    });
    if (!log) {
      throw new AppError("Point log not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const pointsAdjustment = -log.amount;
    const lifetimeAdjustment = shouldAdjustLifetimeForRemovedLog(log.amount, log.reason)
      ? -log.amount
      : 0;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { points: true, lifetimePoints: true },
      });
      if (!user) throw new Error("User missing in transaction");

      const nextPoints = Math.max(0, user.points + pointsAdjustment);
      const nextLifetime = Math.max(0, user.lifetimePoints + lifetimeAdjustment);

      const archive = await tx.pointLogArchive.create({
        data: {
          userId,
          originalLogId: log.id,
          amount: log.amount,
          reason: log.reason,
          logCreatedAt: log.createdAt,
          archivedByClerkId: adminClerkId,
          adminReason,
        },
      });

      await tx.pointLog.delete({ where: { id: log.id } });

      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          points: nextPoints,
          lifetimePoints: nextLifetime,
        },
        select: { points: true, lifetimePoints: true },
      });

      return { archiveId: archive.id, updated };
    });

    await adminPointLogArchived(
      adminClerkId,
      userId,
      {
        archiveId: result.archiveId,
        originalLogId: log.id,
        amount: log.amount,
        logReason: log.reason,
        adminReason,
        newPoints: result.updated.points,
        newLifetimePoints: result.updated.lifetimePoints,
      },
      { tenantId }
    );

    return successResponse({
      message: "Point log archived",
      points: {
        current: result.updated.points,
        lifetimeEarned: result.updated.lifetimePoints,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleApiError(
        new AppError("Invalid request", ErrorType.VALIDATION, {
          status: 400,
          details: error.flatten(),
        })
      );
    }
    return handleApiError(error);
  }
}
