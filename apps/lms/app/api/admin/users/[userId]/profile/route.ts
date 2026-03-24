import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import { objectIdSchema } from "@skill-learn/lib/zodSchemas";
import { z } from "zod";

type Params = { params: Promise<{ userId: string }> };

type ContentStatus = "not_started" | "in_progress" | "completed";

function countByStatus<T extends { status: ContentStatus }>(items: T[]) {
  return {
    total: items.length,
    completed: items.filter((i) => i.status === "completed").length,
    inProgress: items.filter((i) => i.status === "in_progress").length,
    notStarted: items.filter((i) => i.status === "not_started").length,
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = adminResult;
    if (!tenantId) {
      throw new AppError("Tenant context required", ErrorType.VALIDATION, { status: 400 });
    }

    const { userId } = await z.object({ userId: objectIdSchema }).parseAsync(await params);

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        clerkId: true,
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        points: true,
        lifetimePoints: true,
        createdAt: true,
        tenantId: true,
      },
    });

    if (!targetUser) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    if (targetUser.tenantId !== tenantId) {
      throw new AppError("User not in your tenant", ErrorType.FORBIDDEN, { status: 403 });
    }

    const roleAssignment = await prisma.userRole.findFirst({
      where: { userId: targetUser.clerkId, tenantId },
      include: { tenantRole: { select: { roleAlias: true } } },
    });
    const tenantRole = roleAssignment?.tenantRole?.roleAlias ?? null;

    const { searchParams } = new URL(request.url);
    const pointsPage = Math.max(1, parseInt(searchParams.get("pointsPage") || "1", 10));
    const pointsLimit = Math.min(100, Math.max(10, parseInt(searchParams.get("pointsLimit") || "50", 10)));

    const [courses, quizzesCatalog] = await Promise.all([
      prisma.course.findMany({
        where: buildTenantContentFilter(tenantId, { status: "Published" }),
        select: {
          id: true,
          title: true,
          slug: true,
          chapters: {
            select: {
              lessons: { select: { id: true } },
            },
          },
        },
      }),
      prisma.quiz.findMany({
        where: buildTenantContentFilter(tenantId, { isActive: true }),
        select: { id: true, title: true },
      }),
    ]);

    const courseIds = courses.map((c) => c.id);
    const allLessonIds = courses.flatMap((c) =>
      c.chapters.flatMap((ch) => ch.lessons.map((l) => l.id))
    );

    const [courseProgressRows, lessonProgressRows, qpRows, pointLogs, pointLogsTotal] =
      await Promise.all([
        courseIds.length
          ? prisma.courseProgress.findMany({
              where: { userId, courseId: { in: courseIds } },
            })
          : Promise.resolve([]),
        allLessonIds.length
          ? prisma.lessonProgress.findMany({
              where: { userId, lessonId: { in: allLessonIds } },
              select: { lessonId: true },
            })
          : Promise.resolve([]),
        quizzesCatalog.length
          ? prisma.quizProgress.findMany({
              where: { userId, quizId: { in: quizzesCatalog.map((q) => q.id) } },
            })
          : Promise.resolve([]),
        prisma.pointLog.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip: (pointsPage - 1) * pointsLimit,
          take: pointsLimit,
          select: {
            id: true,
            amount: true,
            reason: true,
            createdAt: true,
          },
        }),
        prisma.pointLog.count({ where: { userId } }),
      ]);

    const lessonDoneSet = new Set(lessonProgressRows.map((l) => l.lessonId));
    const courseProgressByCourseId = new Map(courseProgressRows.map((r) => [r.courseId, r]));

    const courseItems = courses.map((course) => {
      const lessonIds = course.chapters.flatMap((ch) => ch.lessons.map((l) => l.id));
      const totalLessons = lessonIds.length;
      const completedLessons = lessonIds.filter((id) => lessonDoneSet.has(id)).length;
      const cp = courseProgressByCourseId.get(course.id);
      const courseCompleted = !!cp?.completedAt;
      let status: ContentStatus;
      if (courseCompleted) status = "completed";
      else if (completedLessons > 0) status = "in_progress";
      else status = "not_started";
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        type: "course" as const,
        status,
        completedLessons,
        totalLessons,
        progressPercent:
          totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        completedAt: cp?.completedAt ?? null,
      };
    });

    const qpByQuiz = new Map(qpRows.map((r) => [r.quizId, r]));
    const quizItems = quizzesCatalog.map((quiz) => {
      const qp = qpByQuiz.get(quiz.id);
      const attempts = qp?.attempts ?? 0;
      const passed = qp?.passedAttempts ?? 0;
      let status: ContentStatus;
      if (!qp || attempts === 0) status = "not_started";
      else if (passed > 0) status = "completed";
      else status = "in_progress";
      return {
        id: quiz.id,
        title: quiz.title,
        type: "quiz" as const,
        status,
        attempts,
        passedAttempts: passed,
        bestScore: qp?.bestScore ?? null,
      };
    });

    const courseSummary = countByStatus(courseItems);
    const quizSummary = countByStatus(quizItems);

    return successResponse({
      user: {
        id: targetUser.id,
        username: targetUser.username,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        imageUrl: targetUser.imageUrl,
        createdAt: targetUser.createdAt,
        tenantRole,
      },
      points: {
        current: targetUser.points,
        lifetimeEarned: targetUser.lifetimePoints,
      },
      contentSummary: {
        courses: courseSummary,
        quizzes: quizSummary,
      },
      courses: courseItems,
      quizzes: quizItems,
      pointLogs: pointLogs.map((p) => ({
        id: p.id,
        amount: p.amount,
        reason: p.reason,
        createdAt: p.createdAt,
      })),
      pointLogsPagination: {
        page: pointsPage,
        limit: pointsLimit,
        total: pointLogsTotal,
        pages: Math.ceil(pointLogsTotal / pointsLimit) || 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
