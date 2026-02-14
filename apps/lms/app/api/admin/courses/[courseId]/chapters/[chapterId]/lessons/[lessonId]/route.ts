import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireCanEditCourse } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import { resolveCourseId, generateUniqueLessonSlug } from "@/lib/courses";
import type { RouteContext } from "@/types";

type CourseLessonParams = { courseId: string; chapterId: string; lessonId: string };

// Resolve lesson by id or slug within a course
function lessonWhere(courseId: string, lessonIdOrSlug: string) {
  const isId = /^[a-f0-9]{24}$/i.test(lessonIdOrSlug);
  return {
    ...(isId ? { id: lessonIdOrSlug } : { slug: lessonIdOrSlug }),
    chapter: { courseId },
  };
}

// Get a single lesson (for edit page). Params may be id or slug; chapterId in URL is ignored for lookup.
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<CourseLessonParams>
) {
  try {
    const { courseId: courseIdOrSlug, lessonId: lessonIdOrSlug } = await params;
    if (!courseIdOrSlug || !lessonIdOrSlug) {
      throw new AppError("Course ID and Lesson ID are required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const tenantId = await getTenantId();
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const lesson = await prisma.lesson.findFirst({
      where: lessonWhere(courseId, lessonIdOrSlug),
      include: {
        chapter: {
          select: { id: true, title: true, slug: true, courseId: true },
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

// Update a lesson (title, content, position). Params may be id or slug.
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<CourseLessonParams>
) {
  try {
    const { courseId: courseIdOrSlug, lessonId: lessonIdOrSlug } = await params;
    if (!courseIdOrSlug || !lessonIdOrSlug) {
      throw new AppError("Course ID and Lesson ID are required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const tenantId = await getTenantId();
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const lesson = await prisma.lesson.findFirst({
      where: lessonWhere(courseId, lessonIdOrSlug),
    });
    if (!lesson) {
      throw new AppError("Lesson not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    const effectiveChapterId = lesson.chapterId;

    const body = await request.json();
    const data: { title?: string; slug?: string; content?: string; videoUrl?: string | null; position?: number } = {};
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
      data.slug = await generateUniqueLessonSlug(
        prisma,
        effectiveChapterId,
        trimmed,
        lesson.id
      );
    }
    if (body?.content !== undefined) data.content = String(body.content ?? "");
    if (body?.videoUrl !== undefined) data.videoUrl = body.videoUrl ? String(body.videoUrl).trim() : null;
    if (typeof body?.position === "number") {
      const pos = Math.floor(Number(body.position));
      if (!Number.isInteger(body.position) || pos < 0) {
        throw new AppError("Position must be a non-negative integer", ErrorType.VALIDATION, {
          status: 400,
          fieldErrors: { position: ["Position must be 0 or greater"] },
        });
      }
      const lessonCount = await prisma.lesson.count({
        where: { chapterId: effectiveChapterId },
      });
      data.position = Math.min(Math.max(0, pos), Math.max(0, lessonCount - 1));
    }

    const updated = await prisma.lesson.update({
      where: { id: lesson.id },
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

// Delete a lesson. Params may be id or slug.
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<CourseLessonParams>
) {
  try {
    const { courseId: courseIdOrSlug, lessonId: lessonIdOrSlug } = await params;
    if (!courseIdOrSlug || !lessonIdOrSlug) {
      throw new AppError("Course ID and Lesson ID are required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const tenantId = await getTenantId();
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const lesson = await prisma.lesson.findFirst({
      where: lessonWhere(courseId, lessonIdOrSlug),
    });
    if (!lesson) {
      throw new AppError("Lesson not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    await prisma.lesson.delete({
      where: { id: lesson.id },
    });

    return successResponse({
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
