import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getCourseWithChaptersAndLessons } from "@/lib/courses";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import type { RouteContext } from "@/types";

type CourseIdParams = { courseId: string };

/**
 * GET /api/user/courses/[courseId]/progress
 * Returns course progress for the current user: completed lesson IDs, course completed, percent.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<CourseIdParams>
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { courseId } = await params;
    if (!courseId) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const course = await getCourseWithChaptersAndLessons(courseId);
    if (!course) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    if (course.status !== "Published") {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const tenantId = await getTenantId();
    const allowed = tenantId
      ? course.tenantId === tenantId || (course.isGlobal && !course.tenantId)
      : course.isGlobal && !course.tenantId;
    if (!allowed) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const courseProgress = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    });

    const lessonProgressList = await prisma.lessonProgress.findMany({
      where: { userId: user.id, lessonId: { in: getAllLessonIds(course.chapters) } },
      select: { lessonId: true },
    });
    const completedLessonIds = lessonProgressList.map((p) => p.lessonId);

    const totalLessons = countLessons(course.chapters);
    const completedCount = completedLessonIds.length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return successResponse({
      completedLessonIds,
      courseCompleted: !!courseProgress?.completedAt,
      completedAt: courseProgress?.completedAt ?? null,
      progressPercent,
      completedCount,
      totalLessons,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function getAllLessonIds(chapters) {
  if (!Array.isArray(chapters)) return [];
  return chapters.flatMap((ch) => (ch.lessons ?? []).map((l) => l.id));
}

function countLessons(chapters) {
  return getAllLessonIds(chapters).length;
}
