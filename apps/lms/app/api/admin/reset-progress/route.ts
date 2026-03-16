import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { resetProgressSchema } from "@skill-learn/lib/zodSchemas";
import { userPointsAdjustedForReset, userProgressReset } from "@skill-learn/lib/utils/auditLogger";

export async function POST(req: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const body = await req.json();
    const parsed = resetProgressSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Invalid request body", ErrorType.VALIDATION, {
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const { userId, moduleId, reason, resetPointsMode, pointLogIds } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.userProgress.findFirst({
        where: {
          userId,
          moduleId,
          status: "IN_PROGRESS",
        },
        orderBy: {
          attempt: "desc",
        },
      });

      if (!current) {
        throw new AppError("Active progress not found for user and module", ErrorType.NOT_FOUND, {
          status: 404,
        });
      }

      const archived = await tx.userProgress.update({
        where: { id: current.id },
        data: {
          status: "ARCHIVED",
          resetReason: reason,
          resetAt: new Date(),
        },
      });

      const newProgress = await tx.userProgress.create({
        data: {
          userId: archived.userId,
          moduleId: archived.moduleId,
          attempt: archived.attempt + 1,
          status: "IN_PROGRESS",
          points: 0,
        },
      });

      // Optionally reset or adjust points with full audit via PointLog
      let pointsAdjustment: { newPoints: number; delta: number } | null = null;

      if (resetPointsMode === "total" || (resetPointsMode === "logs" && pointLogIds.length > 0)) {
        // Fetch user to get current points and confirm existence
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, points: true, lifetimePoints: true },
        });

        if (!user) {
          throw new AppError("User not found for points reset", ErrorType.NOT_FOUND, {
            status: 404,
          });
        }

        if (resetPointsMode === "total") {
          const currentPoints = user.points ?? 0;
          const delta = currentPoints === 0 ? 0 : -currentPoints;

          if (delta !== 0) {
            await tx.pointLog.create({
              data: {
                userId: user.id,
                amount: delta,
                reason: `progress_reset_total:${reason}`,
              },
            });

            const updatedUser = await tx.user.update({
              where: { id: user.id },
              data: {
                points: { increment: delta },
              },
              select: { points: true },
            });

            pointsAdjustment = { newPoints: updatedUser.points, delta };
          }
        } else if (resetPointsMode === "logs" && pointLogIds.length > 0) {
          const logs = await tx.pointLog.findMany({
            where: {
              id: { in: pointLogIds },
              userId: user.id,
            },
          });

          if (logs.length > 0) {
            let totalDelta = 0;

            for (const log of logs) {
              const delta = -log.amount;
              if (delta === 0) continue;
              totalDelta += delta;

              await tx.pointLog.create({
                data: {
                  userId: user.id,
                  amount: delta,
                  reason: `progress_reset_log:${log.id}:${log.reason ?? ""}`,
                },
              });
            }

            if (totalDelta !== 0) {
              const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: {
                  points: { increment: totalDelta },
                },
                select: { points: true },
              });

              pointsAdjustment = { newPoints: updatedUser.points, delta: totalDelta };
            }
          }
        }
      }

      return { archived, new: newProgress, pointsAdjustment };
    });

    const { userId: adminClerkId, user, tenantId } = adminResult;

    await userProgressReset(
      adminClerkId,
      result.archived.userId,
      result.archived.moduleId,
      {
        reason,
        statusBefore: "IN_PROGRESS",
        statusAfter: "IN_PROGRESS",
        attemptBefore: result.archived.attempt,
        attemptAfter: result.new.attempt,
        resetPointsMode,
        pointsAdjustment: result.pointsAdjustment ?? null,
      },
      {
        tenantId: tenantId ?? null,
      }
    );

    if (result.pointsAdjustment && resetPointsMode !== "none") {
      await userPointsAdjustedForReset(
        adminClerkId,
        result.archived.userId,
        result.pointsAdjustment,
        resetPointsMode === "logs" ? "logs" : "total",
        reason,
        {
          tenantId: tenantId ?? null,
        }
      );
    }

    return successResponse({
      message: "User progress reset successfully",
      archived: result.archived,
      progress: result.new,
      pointsAdjustment: result.pointsAdjustment,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

