import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { chapterSchema } from "@/lib/zodSchemas";
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

// GET - Get a chapter (with lessons)
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

    return successResponse({ chapter });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Update a chapter
export async function PUT(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { courseId, chapterId } = await params;
    if (!courseId || !chapterId) {
      throw new AppError("Course ID and Chapter ID are required", ErrorType.VALIDATION, { status: 400 });
    }

    const existing = await prisma.chapter.findFirst({
      where: { id: chapterId, courseId },
    });
    if (!existing) {
      throw new AppError("Chapter not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const body = await request.json();
    const validation = chapterSchema.safeParse(body);
    if (!validation.success) {
      throw new AppError("Invalid input", ErrorType.VALIDATION, {
        status: 400,
        details: validation.error.flatten(),
      });
    }

    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: validation.data.title,
        position: validation.data.order ?? validation.data.position ?? 0,
      },
    });

    return successResponse({ chapter });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Delete a chapter (cascades to lessons)
export async function DELETE(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { courseId, chapterId } = await params;
    if (!courseId || !chapterId) {
      throw new AppError("Course ID and Chapter ID are required", ErrorType.VALIDATION, { status: 400 });
    }

    const existing = await prisma.chapter.findFirst({
      where: { id: chapterId, courseId },
    });
    if (!existing) {
      throw new AppError("Chapter not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    await prisma.chapter.delete({ where: { id: chapterId } });
    return successResponse({ message: "Chapter deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
