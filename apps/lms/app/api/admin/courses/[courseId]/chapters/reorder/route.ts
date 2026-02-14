import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireCanEditCourse } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import type { RouteContext } from "@/types";

type CourseIdParams = { courseId: string };

// Reorder chapters in one transaction. Body: { chapterIds: string[] }
export async function PUT(
  request: NextRequest,
  { params }: RouteContext<CourseIdParams>
) {
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
    const chapterIds = body?.chapterIds;
    if (!Array.isArray(chapterIds) || chapterIds.length === 0) {
      throw new AppError("chapterIds must be a non-empty array", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const existingChapters = await prisma.courseChapter.findMany({
      where: { courseId },
      select: { id: true },
    });
    const existingIds = new Set(existingChapters.map((c) => c.id));
    const validIds = chapterIds.filter((id) => typeof id === "string" && existingIds.has(id));
    if (validIds.length !== chapterIds.length) {
      throw new AppError(
        "All chapterIds must be valid and belong to this course",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }

    await prisma.$transaction(
      validIds.map((id, index) =>
        prisma.courseChapter.update({
          where: { id },
          data: { position: index },
        })
      )
    );

    return successResponse({
      message: "Chapters reordered successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
