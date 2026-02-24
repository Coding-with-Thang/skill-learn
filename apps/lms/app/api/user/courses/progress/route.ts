import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

function parseObjectIdList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => /^[a-f0-9]{24}$/i.test(value));
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const requestedCourseIds = parseObjectIdList(
      request.nextUrl.searchParams.get("courseIds")
    );
    const tenantId = await getTenantId();
    const whereClause = buildTenantContentFilter(tenantId, {
      status: "Published",
    });

    const courses = await prisma.course.findMany({
      where: {
        ...whereClause,
        ...(requestedCourseIds.length > 0
          ? {
              id: { in: requestedCourseIds },
            }
          : {}),
      },
      select: {
        id: true,
        chapters: {
          select: {
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const courseIds = courses.map((course) => course.id);
    if (courseIds.length === 0) {
      return successResponse({ progressByCourseId: {} });
    }

    const lessonIdToCourseId = new Map<string, string>();
    for (const course of courses) {
      for (const chapter of course.chapters) {
        for (const lesson of chapter.lessons) {
          lessonIdToCourseId.set(lesson.id, course.id);
        }
      }
    }

    const allLessonIds = Array.from(lessonIdToCourseId.keys());
    const lessonProgressRows =
      allLessonIds.length > 0
        ? await prisma.lessonProgress.findMany({
            where: {
              userId: user.id,
              lessonId: { in: allLessonIds },
            },
            select: { lessonId: true, completedAt: true },
          })
        : [];

    const courseProgressRows = await prisma.courseProgress.findMany({
      where: {
        userId: user.id,
        courseId: { in: courseIds },
      },
      select: {
        courseId: true,
        completedAt: true,
      },
    });

    const completedLessonsByCourse = new Map<string, string[]>();
    for (const row of lessonProgressRows) {
      const courseId = lessonIdToCourseId.get(row.lessonId);
      if (!courseId) continue;
      const current = completedLessonsByCourse.get(courseId) ?? [];
      current.push(row.lessonId);
      completedLessonsByCourse.set(courseId, current);
    }

    const courseCompletionMap = new Map<string, Date | null>();
    for (const row of courseProgressRows) {
      courseCompletionMap.set(row.courseId, row.completedAt);
    }

    const progressByCourseId: Record<string, unknown> = {};
    for (const course of courses) {
      const completedLessonIds = completedLessonsByCourse.get(course.id) ?? [];
      const totalLessons = course.chapters.reduce(
        (sum, chapter) => sum + chapter.lessons.length,
        0
      );
      const completedCount = completedLessonIds.length;
      const progressPercent =
        totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      const completedAt = courseCompletionMap.get(course.id) ?? null;
      const courseCompleted = Boolean(completedAt);

      progressByCourseId[course.id] = {
        completedLessonIds,
        completedCount,
        totalLessons,
        progressPercent,
        courseCompleted,
        completedAt,
        status: courseCompleted
          ? "completed"
          : completedCount > 0
            ? "in-progress"
            : "not-started",
      };
    }

    return successResponse({ progressByCourseId });
  } catch (error) {
    return handleApiError(error);
  }
}
