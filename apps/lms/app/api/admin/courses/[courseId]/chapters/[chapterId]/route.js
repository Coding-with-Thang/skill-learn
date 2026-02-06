import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireCanEditCourse } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

// Update a chapter (title, position)
export async function PATCH(request, { params }) {
  try {
    const { courseId, chapterId } = await params;
    if (!courseId || !chapterId) {
      throw new AppError("Course ID and Chapter ID are required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const chapter = await prisma.courseChapter.findFirst({
      where: { id: chapterId, courseId },
    });
    if (!chapter) {
      throw new AppError("Chapter not found", ErrorType.NOT_FOUND, { status: 404 });
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
      const chapterCount = await prisma.courseChapter.count({ where: { courseId } });
      data.position = Math.min(Math.max(0, pos), Math.max(0, chapterCount - 1));
    }

    const updated = await prisma.courseChapter.update({
      where: { id: chapterId },
      data,
    });

    return successResponse({
      message: "Chapter updated successfully",
      chapter: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete a chapter (and its lessons via cascade)
export async function DELETE(request, { params }) {
  try {
    const { courseId, chapterId } = await params;
    if (!courseId || !chapterId) {
      throw new AppError("Course ID and Chapter ID are required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const chapter = await prisma.courseChapter.findFirst({
      where: {
        id: chapterId,
        courseId,
      },
    });

    if (!chapter) {
      throw new AppError("Chapter not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    await prisma.courseChapter.delete({
      where: { id: chapterId },
    });

    return successResponse({
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
