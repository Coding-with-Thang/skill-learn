import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { objectIdSchema } from "@skill-learn/lib/zodSchemas";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import {
  collectReferencedQuizAndCourseIdsFromReasons,
  formatPointLogReasonDisplay,
  mapsFromCatalog,
  mergeTitleRowsIntoMaps,
  normalizePointLogEntityId,
} from "@/lib/pointLogReasonDisplay";

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

function shortenUserAgent(ua: string | null | undefined): { label: string; isMobile: boolean } {
  if (!ua?.trim()) return { label: "—", isMobile: false };
  const isMobile = /Mobile|Android|iPhone|iPad|webOS/i.test(ua);
  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  let os = "";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { label: os ? `${browser} on ${os}` : browser, isMobile };
}

function formatActivityTypeLabel(action: string | null | undefined, eventType: string | null | undefined) {
  if (action && action.trim().length > 0) {
    return action.replace(/\s+/g, "_").toUpperCase();
  }
  const parts = (eventType || "").split(".").filter(Boolean);
  const last = parts[parts.length - 1] || "EVENT";
  return last.replace(/[^a-z0-9]+/gi, "_").toUpperCase();
}

function formatActivityDetails(
  message: string | null | undefined,
  eventType: string,
  outcome: string
) {
  if (message?.trim()) return message.trim();
  return `${eventType} (${outcome})`;
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
        email: true,
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
    const activityHours = Math.min(168, Math.max(1, parseInt(searchParams.get("activityHours") || "24", 10)));
    const activityLimit = Math.min(50, Math.max(5, parseInt(searchParams.get("activityLimit") || "30", 10)));
    const activitySince = new Date(Date.now() - activityHours * 60 * 60 * 1000);

    const [clerkProfileImageUrl, courses, quizzesCatalog] = await Promise.all([
      (async (): Promise<string | null> => {
        try {
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(targetUser.clerkId);
          const url = clerkUser.imageUrl?.trim();
          return url && url.length > 0 ? url : null;
        } catch {
          return null;
        }
      })(),
      prisma.course.findMany({
        where: buildTenantContentFilter(tenantId, { status: "Published" }),
        select: {
          id: true,
          title: true,
          slug: true,
          fileKey: true,
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

    const profileImageUrl = clerkProfileImageUrl || targetUser.imageUrl || null;

    const courseIds = courses.map((c) => c.id);
    const allLessonIds = courses.flatMap((c) =>
      c.chapters.flatMap((ch) => ch.lessons.map((l) => l.id))
    );

    const [courseProgressRows, lessonProgressRows, qpRows, pointLogs, pointLogsTotal, activityEvents] =
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
        prisma.securityAuditEvent.findMany({
          where: {
            tenantId,
            actorUserId: userId,
            occurredAt: { gte: activitySince },
          },
          orderBy: { occurredAt: "desc" },
          take: activityLimit,
          select: {
            id: true,
            eventType: true,
            category: true,
            action: true,
            message: true,
            ipAddress: true,
            userAgent: true,
            occurredAt: true,
            outcome: true,
          },
        }),
      ]);

    const lessonDoneSet = new Set(lessonProgressRows.map((l) => l.lessonId));
    const courseProgressByCourseId = new Map(
      courseProgressRows.map((r) => [r.courseId, r] as const)
    );

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

    const courseItemsWithCovers = await Promise.all(
      courseItems.map(async (item) => {
        const courseRow = courses.find((c) => c.id === item.id);
        const fk = courseRow?.fileKey;
        if (!fk?.trim()) {
          return { ...item, coverImageUrl: null as string | null };
        }
        try {
          const url = await getSignedUrl(fk, 1);
          return { ...item, coverImageUrl: url || null };
        } catch {
          return { ...item, coverImageUrl: null as string | null };
        }
      })
    );

    const qpByQuiz = new Map(qpRows.map((r) => [r.quizId, r] as const));
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

    const basePointLogMaps = mapsFromCatalog(quizzesCatalog, courses);
    const { quizIds: refQuizIds, courseIds: refCourseIds } = collectReferencedQuizAndCourseIdsFromReasons(
      pointLogs.map((p) => p.reason)
    );
    const missingQuizIds = refQuizIds.filter(
      (id) => !basePointLogMaps.quizTitleById.has(normalizePointLogEntityId(id))
    );
    const missingCourseIds = refCourseIds.filter(
      (id) => !basePointLogMaps.courseTitleById.has(normalizePointLogEntityId(id))
    );

    let pointLogReasonMaps = basePointLogMaps;
    if (missingQuizIds.length > 0 || missingCourseIds.length > 0) {
      const [extraQuizzes, extraCourses] = await Promise.all([
        missingQuizIds.length > 0
          ? prisma.quiz.findMany({
              where: {
                id: { in: missingQuizIds },
                ...buildTenantContentFilter(tenantId, {}),
              },
              select: { id: true, title: true },
            })
          : Promise.resolve([]),
        missingCourseIds.length > 0
          ? prisma.course.findMany({
              where: {
                id: { in: missingCourseIds },
                ...buildTenantContentFilter(tenantId, {}),
              },
              select: { id: true, title: true },
            })
          : Promise.resolve([]),
      ]);
      pointLogReasonMaps = mergeTitleRowsIntoMaps(basePointLogMaps, extraQuizzes, extraCourses);
    }

    return successResponse({
      user: {
        id: targetUser.id,
        username: targetUser.username,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        imageUrl: profileImageUrl,
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
      courses: courseItemsWithCovers,
      quizzes: quizItems,
      pointLogs: pointLogs.map((p) => ({
        id: p.id,
        amount: p.amount,
        reason: p.reason,
        reasonDisplay: formatPointLogReasonDisplay(p.reason, pointLogReasonMaps),
        createdAt: p.createdAt,
      })),
      pointLogsPagination: {
        page: pointsPage,
        limit: pointsLimit,
        total: pointLogsTotal,
        pages: Math.ceil(pointLogsTotal / pointsLimit) || 1,
      },
      activityLog: activityEvents.map((e) => {
        const ua = shortenUserAgent(e.userAgent);
        return {
          id: e.id,
          occurredAt: e.occurredAt,
          activityType: formatActivityTypeLabel(e.action, e.eventType),
          details: formatActivityDetails(e.message, e.eventType, e.outcome),
          deviceLabel: ua.label,
          isMobile: ua.isMobile,
          ipAddress: e.ipAddress,
          action: e.action,
          category: e.category,
        };
      }),
      activityWindow: {
        hours: activityHours,
        limit: activityLimit,
        total: activityEvents.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
