import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { resetProgressSchema } from "@skill-learn/lib/zodSchemas";
import {
  userPointsAdjustedForReset,
  adminQuizProgressReset,
  adminCourseProgressReset,
  adminResetAllProgress,
} from "@skill-learn/lib/utils/auditLogger";

type ResetResult = {
  scope: string;
  quizzesReset?: number;
  coursesReset?: number;
  pointsAdjustment?: { newPoints: number; delta: number } | null;
  quizId?: string;
  courseId?: string;
};

function applyPointsReset(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  userId: string,
  reason: string,
  resetPointsMode: "none" | "total" | "logs",
  pointLogIds: string[]
): Promise<{ newPoints: number; delta: number } | null> {
  return (async () => {
    if (resetPointsMode === "none" || (resetPointsMode === "logs" && pointLogIds.length === 0))
      return null;

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, points: true },
    });
    if (!user) return null;

    if (resetPointsMode === "total") {
      const currentPoints = user.points ?? 0;
      const delta = currentPoints === 0 ? 0 : -currentPoints;
      if (delta === 0) return null;
      await tx.pointLog.create({
        data: {
          userId: user.id,
          amount: delta,
          reason: `progress_reset_total:${reason}`,
        },
      });
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { points: { increment: delta } },
        select: { points: true },
      });
      return { newPoints: updated.points, delta };
    }

    if (resetPointsMode === "logs" && pointLogIds.length > 0) {
      const logs = await tx.pointLog.findMany({
        where: { id: { in: pointLogIds }, userId: user.id },
      });
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
      if (totalDelta === 0) return null;
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { points: { increment: totalDelta } },
        select: { points: true },
      });
      return { newPoints: updated.points, delta: totalDelta };
    }

    return null;
  })();
}

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

    const { userId, reason, scope, quizId, courseId, resetPointsMode, pointLogIds } = parsed.data;
    const { userId: adminClerkId, tenantId } = adminResult;

    const result = await prisma.$transaction(async (tx) => {
      const results: ResetResult = { scope };

      if (scope === "all") {
        const quizRows = await tx.quizProgress.findMany({
          where: { userId },
          select: { id: true, quizId: true, attempts: true, passedAttempts: true, bestScore: true },
        });
        for (const row of quizRows) {
          await tx.quizProgress.update({
            where: { id: row.id },
            data: {
              attempts: 0,
              completedAttempts: 0,
              passedAttempts: 0,
              averageScore: null,
              bestScore: null,
              lastAttemptAt: null,
              lastPassedAt: null,
            },
          });
        }

        const courseRows = await tx.courseProgress.findMany({
          where: { userId },
          select: { id: true, courseId: true },
        });
        for (const row of courseRows) {
          const lessonIds = await tx.lesson.findMany({
            where: { chapter: { courseId: row.courseId } },
            select: { id: true },
          }).then((lessons) => lessons.map((l) => l.id));
          if (lessonIds.length > 0) {
            await tx.lessonProgress.deleteMany({
              where: { userId, lessonId: { in: lessonIds } },
            });
          }
          await tx.courseProgress.update({
            where: { id: row.id },
            data: { completedAt: null },
          });
        }

        results.quizzesReset = quizRows.length;
        results.coursesReset = courseRows.length;

        const pointsResult = await applyPointsReset(tx, userId, reason, resetPointsMode, pointLogIds ?? []);
        results.pointsAdjustment = pointsResult;

        await adminResetAllProgress(
          adminClerkId,
          userId,
          reason,
          {
            quizzesReset: results.quizzesReset,
            coursesReset: results.coursesReset ?? 0,
            pointsReset: !!results.pointsAdjustment,
          },
          { tenantId: tenantId ?? undefined }
        );
        return results;
      }

      if (scope === "quiz" && quizId) {
        const row = await tx.quizProgress.findUnique({
          where: { userId_quizId: { userId, quizId } },
          select: { id: true, attempts: true, passedAttempts: true, bestScore: true },
        });
        const beforeState = row
          ? { attempts: row.attempts, passedAttempts: row.passedAttempts, bestScore: row.bestScore }
          : { attempts: 0, passedAttempts: 0, bestScore: null as number | null };
        if (row) {
          await tx.quizProgress.update({
            where: { id: row.id },
            data: {
              attempts: 0,
              completedAttempts: 0,
              passedAttempts: 0,
              averageScore: null,
              bestScore: null,
              lastAttemptAt: null,
              lastPassedAt: null,
            },
          });
        }
        results.quizId = quizId;
        const pointsResult = await applyPointsReset(tx, userId, reason, resetPointsMode, pointLogIds ?? []);
        results.pointsAdjustment = pointsResult;

        await adminQuizProgressReset(adminClerkId, userId, quizId, reason, beforeState, {
          tenantId: tenantId ?? undefined,
        });
        if (results.pointsAdjustment && resetPointsMode !== "none") {
          await userPointsAdjustedForReset(
            adminClerkId,
            userId,
            results.pointsAdjustment,
            resetPointsMode === "logs" ? "logs" : "total",
            reason,
            { tenantId: tenantId ?? undefined }
          );
        }
        return results;
      }

      if (scope === "course" && courseId) {
        const row = await tx.courseProgress.findUnique({
          where: { userId_courseId: { userId, courseId } },
          select: { id: true },
        });
        const lessonIds = await tx.lesson
          .findMany({
            where: { chapter: { courseId } },
            select: { id: true },
          })
          .then((lessons) => lessons.map((l) => l.id));
        if (lessonIds.length > 0) {
          await tx.lessonProgress.deleteMany({
            where: { userId, lessonId: { in: lessonIds } },
          });
        }
        if (row) {
          await tx.courseProgress.update({
            where: { id: row.id },
            data: { completedAt: null },
          });
        }
        results.courseId = courseId;
        const pointsResult = await applyPointsReset(tx, userId, reason, resetPointsMode, pointLogIds ?? []);
        results.pointsAdjustment = pointsResult;

        await adminCourseProgressReset(adminClerkId, userId, courseId, reason, {
          tenantId: tenantId ?? undefined,
        });
        if (results.pointsAdjustment && resetPointsMode !== "none") {
          await userPointsAdjustedForReset(
            adminClerkId,
            userId,
            results.pointsAdjustment,
            resetPointsMode === "logs" ? "logs" : "total",
            reason,
            { tenantId: tenantId ?? undefined }
          );
        }
        return results;
      }

      if (scope === "points") {
        const pointsResult = await applyPointsReset(tx, userId, reason, resetPointsMode, pointLogIds ?? []);
        results.pointsAdjustment = pointsResult;
        if (results.pointsAdjustment) {
          await userPointsAdjustedForReset(
            adminClerkId,
            userId,
            results.pointsAdjustment,
            resetPointsMode === "logs" ? "logs" : "total",
            reason,
            { tenantId: tenantId ?? undefined }
          );
        }
        return results;
      }

      throw new AppError("Invalid scope or missing ids", ErrorType.VALIDATION, { status: 400 });
    });

    return successResponse({
      message: "Reset completed successfully",
      ...result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
