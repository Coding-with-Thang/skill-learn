import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { chapterSchema } from "@/lib/zodSchemas";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { resolveCourseId, generateUniqueChapterSlug } from "@/lib/courses";

// POST - Create a chapter for a course. courseId param may be id or slug.
export async function POST(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { courseId: courseIdOrSlug } = await params;
    if (!courseIdOrSlug) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, { status: 400 });
    }

    const tenantId = await getTenantId();
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const body = await request.json();
    const validation = chapterSchema.safeParse(body);
    if (!validation.success) {
      throw new AppError("Invalid input", ErrorType.VALIDATION, {
        status: 400,
        details: validation.error.flatten(),
      });
    }

    const slug = await generateUniqueChapterSlug(prisma, courseId, validation.data.title);

    const chapter = await prisma.chapter.create({
      data: {
        courseId,
        title: validation.data.title,
        slug,
        position: validation.data.order ?? validation.data.position ?? 0,
      },
    });

    return successResponse({ chapter });
  } catch (error) {
    return handleApiError(error);
  }
}
