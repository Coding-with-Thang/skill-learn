import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireCanEditCourse } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

// Update a lesson (title, position)
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

    const lesson = await prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        courseChapterId: chapterId,
        courseChapter: { courseId },
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
    if (body?.description !== undefined) data.description = body.description;
    if (typeof body?.position === "number") {
      const pos = Math.floor(Number(body.position));
      if (!Number.isInteger(body.position) || pos < 0) {
        throw new AppError("Position must be a non-negative integer", ErrorType.VALIDATION, {
          status: 400,
          fieldErrors: { position: ["Position must be 0 or greater"] },
        });
      }
      const lessonCount = await prisma.courseLesson.count({
        where: { courseChapterId: chapterId },
      });
      data.position = Math.min(Math.max(0, pos), Math.max(0, lessonCount - 1));
    }

    const updated = await prisma.courseLesson.update({
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

    const lesson = await prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        courseChapterId: chapterId,
        courseChapter: { courseId },
      },
    });
    if (!lesson) {
      throw new AppError("Lesson not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    await prisma.courseLesson.delete({
      where: { id: lessonId },
    });

    return successResponse({
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
