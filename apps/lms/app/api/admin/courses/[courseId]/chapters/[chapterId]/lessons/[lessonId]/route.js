import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireCanEditCourse } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

// Get a single lesson (for edit page)
export async function GET(request, { params }) {
  try {
    const { courseId, chapterId, lessonId } = await params;
    if (!courseId || !chapterId || !lessonId) {
      throw new AppError("Course ID, Chapter ID and Lesson ID are required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        chapterId,
        chapter: { courseId },
      },
      include: {
        chapter: {
          select: { id: true, title: true, courseId: true },
        },
      },
    });
    if (!lesson) {
      throw new AppError("Lesson not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    return successResponse({ lesson });
  } catch (error) {
    return handleApiError(error);
  }
}

// Update a lesson (title, content, position)
export async function PATCH(request, { params }) {
  try {
    const { courseId, chapterId, lessonId } = await params;
    if (!courseId || !chapterId || !lessonId) {
      throw new AppError("Course ID, Chapter ID and Lesson ID are required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        chapterId,
        chapter: { courseId },
      },
    });
    if (!lesson) {
      throw new AppError("Lesson not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const body = await request.json();
    const data = {};
    if (typeof body?.title === "string") {
      const trimmed = body.title.trim();
      if (trimmed.length === 0) {
        throw new AppError("Title is required", ErrorType.VALIDATION, {
          status: 400,
          fieldErrors: { title: ["Title is required"] },
        });
      }
      if (trimmed.length > 200) {
        throw new AppError("Title is too long", ErrorType.VALIDATION, {
          status: 400,
          fieldErrors: { title: ["Title must be 200 characters or less"] },
        });
      }
      data.title = trimmed;
    }
    if (body?.content !== undefined) data.content = String(body.content ?? "");
    if (typeof body?.position === "number") {
      const pos = Math.floor(Number(body.position));
      if (!Number.isInteger(body.position) || pos < 0) {
        throw new AppError("Position must be a non-negative integer", ErrorType.VALIDATION, {
          status: 400,
          fieldErrors: { position: ["Position must be 0 or greater"] },
        });
      }
      const lessonCount = await prisma.lesson.count({
        where: { chapterId },
      });
      data.position = Math.min(Math.max(0, pos), Math.max(0, lessonCount - 1));
    }

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    return successResponse({
      message: "Lesson updated successfully",
      lesson: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete a lesson
export async function DELETE(request, { params }) {
  try {
    const { courseId, chapterId, lessonId } = await params;
    if (!courseId || !chapterId || !lessonId) {
      throw new AppError("Course ID, Chapter ID and Lesson ID are required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        chapterId,
        chapter: { courseId },
      },
    });
    if (!lesson) {
      throw new AppError("Lesson not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return successResponse({
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
