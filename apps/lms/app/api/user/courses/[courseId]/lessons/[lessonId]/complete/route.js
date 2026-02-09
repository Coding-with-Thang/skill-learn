import { NextResponse } from "next/server";
import { requireAuth } from "@skill-learn/lib/utils/auth.js";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getCourseWithChaptersAndLessons } from "@/lib/courses.js";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";

/**
 * POST /api/user/courses/[courseId]/lessons/[lessonId]/complete
 * Mark a lesson as completed for the current user (idempotent).
 */
export async function POST(request, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const { courseId, lessonId } = await params;
    if (!courseId || !lessonId) {
      throw new AppError("Course ID and Lesson ID are required", ErrorType.VALIDATION, {
        status: 400,
      });
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

    const lessonIds = (course.chapters ?? []).flatMap((ch) => (ch.lessons ?? []).map((l) => l.id));
    if (!lessonIds.includes(lessonId)) {
      throw new AppError("Lesson not found in this course", ErrorType.NOT_FOUND, { status: 404 });
    }

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      create: { userId: user.id, lessonId },
      update: {},
    });

    return successResponse({ completed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
