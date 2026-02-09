import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { lessonSchema } from "@/lib/zodSchemas";
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

// GET - List lessons in a chapter
export async function GET(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { courseId, chapterId } = await params;
    if (!courseId || !chapterId) {
      throw new AppError("Course ID and Chapter ID are required", ErrorType.VALIDATION, { status: 400 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, courseId },
      include: { lessons: { orderBy: { position: "asc" } } },
    });
    if (!chapter) {
      throw new AppError("Chapter not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    return successResponse({ lessons: chapter.lessons });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create a lesson
export async function POST(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { courseId, chapterId } = await params;
    if (!courseId || !chapterId) {
      throw new AppError("Course ID and Chapter ID are required", ErrorType.VALIDATION, { status: 400 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, courseId },
    });
    if (!chapter) {
      throw new AppError("Chapter not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const body = await request.json();
    const validation = lessonSchema.safeParse(body);
    if (!validation.success) {
      throw new AppError("Invalid input", ErrorType.VALIDATION, {
        status: 400,
        details: validation.error.flatten(),
      });
    }

    const lesson = await prisma.lesson.create({
      data: {
        chapterId,
        title: validation.data.title,
        content: validation.data.content ?? "",
        position: validation.data.order ?? validation.data.position ?? 0,
      },
    });

    return successResponse({ lesson });
  } catch (error) {
    return handleApiError(error);
  }
}
