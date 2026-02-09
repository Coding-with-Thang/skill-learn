import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { chapterSchema } from "@/lib/zodSchemas";
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

// POST - Create a chapter for a course
export async function POST(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { courseId } = await params;
    if (!courseId) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, { status: 400 });
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

    const chapter = await prisma.chapter.create({
      data: {
        courseId,
        title: validation.data.title,
        position: validation.data.order ?? validation.data.position ?? 0,
      },
    });

    return successResponse({ chapter });
  } catch (error) {
    return handleApiError(error);
  }
}
