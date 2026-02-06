import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireCanEditCourse } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

// Create a new chapter
export async function POST(request, { params }) {
  try {
    const { courseId } = await params;
    if (!courseId) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, { status: 400 });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const rawTitle = body?.title ?? "New Chapter";
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
        : await prisma.courseChapter
            .count({ where: { courseId } })
            .then((c) => c);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const chapter = await prisma.courseChapter.create({
      data: {
        courseId,
        title,
        position,
        description: null,
      },
    });

    return successResponse({
      message: "Chapter created successfully",
      chapter,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
