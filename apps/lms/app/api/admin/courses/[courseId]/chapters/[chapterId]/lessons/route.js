import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireCanEditCourse } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

// Create a new lesson in a chapter
export async function POST(request, { params }) {
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
    const rawTitle = body?.title ?? "New Lesson";
    const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
    if (title.length === 0) {
      throw new AppError("Title is required", ErrorType.VALIDATION, {
        status: 400,
        fieldErrors: { title: ["Title is required"] },
      });
    }
    if (title.length > 200) {
      throw new AppError("Title is too long", ErrorType.VALIDATION, {
        status: 400,
        fieldErrors: { title: ["Title must be 200 characters or less"] },
      });
    }
    const position =
      typeof body?.position === "number"
        ? body.position
        : await prisma.courseLesson
            .count({ where: { courseChapterId: chapterId } })
            .then((c) => c);

    const lesson = await prisma.courseLesson.create({
      data: {
        courseChapterId: chapterId,
        title,
        position,
        description: null,
      },
    });

    return successResponse({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
