import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireCanEditCourse } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

// Reorder lessons in one transaction. Body: { lessonIds: string[] }
export async function PUT(request, { params }) {
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
    const lessonIds = body?.lessonIds;
    if (!Array.isArray(lessonIds)) {
      throw new AppError("lessonIds must be an array", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    if (lessonIds.length === 0) {
      return successResponse({ message: "Lessons reordered successfully" });
    }

    const existingLessons = await prisma.courseLesson.findMany({
      where: { courseChapterId: chapterId },
      select: { id: true },
    });
    const existingIds = new Set(existingLessons.map((l) => l.id));
    const validIds = lessonIds.filter((id) => typeof id === "string" && existingIds.has(id));
    if (validIds.length !== lessonIds.length) {
      throw new AppError(
        "All lessonIds must be valid and belong to this chapter",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }

    await prisma.$transaction(
      validIds.map((id, index) =>
        prisma.courseLesson.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    return successResponse({
      message: "Lessons reordered successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
