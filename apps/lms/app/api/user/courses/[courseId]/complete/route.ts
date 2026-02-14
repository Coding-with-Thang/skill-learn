import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { prisma } from "@skill-learn/database";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getCourseWithChaptersAndLessons } from "@/lib/courses";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import type { RouteContext } from "@/types";

type CourseIdParams = { courseId: string };

/**
 * POST /api/user/courses/[courseId]/complete
 * Mark the course as completed for the current user (sets completedAt).
 */
export async function POST(
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

    const tenantId = await getTenantId();
    const course = await getCourseWithChaptersAndLessons(courseId, tenantId ?? undefined);
    if (!course) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    if (course.status !== "Published") {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const allowed = tenantId
      ? course.tenantId === tenantId || (course.isGlobal && !course.tenantId)
      : course.isGlobal && !course.tenantId;
    if (!allowed) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    await prisma.courseProgress.upsert({
      where: { userId_courseId: { userId: user.id, courseId } },
      create: { userId: user.id, courseId, completedAt: new Date() },
      update: { completedAt: new Date() },
    });

    return successResponse({ completed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
