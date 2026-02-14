import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { chapterSchema } from "@/lib/zodSchemas";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { resolveCourseId, generateUniqueChapterSlug } from "@/lib/courses";
import type { RouteContext } from "@/types";

type CourseChapterParams = { courseId: string; chapterId: string };

function resolveChapterWhere(courseId: string, chapterIdOrSlug: string) {
  return /^[a-f0-9]{24}$/i.test(chapterIdOrSlug)
    ? { id: chapterIdOrSlug, courseId }
    : { slug: chapterIdOrSlug, courseId };
}

// GET - Get a chapter (with lessons). courseId and chapterId params may be id or slug.
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<CourseChapterParams>
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { courseId: courseIdOrSlug, chapterId: chapterIdOrSlug } = await params;
    if (!courseIdOrSlug || !chapterIdOrSlug) {
      throw new AppError("Course ID and Chapter ID are required", ErrorType.VALIDATION, { status: 400 });
    }

    const tenantId = await getTenantId();
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: resolveChapterWhere(courseId, chapterIdOrSlug),
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

// PUT - Update a chapter. courseId and chapterId params may be id or slug.
export async function PUT(
  request: NextRequest,
  { params }: RouteContext<CourseChapterParams>
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { courseId: courseIdOrSlug, chapterId: chapterIdOrSlug } = await params;
    if (!courseIdOrSlug || !chapterIdOrSlug) {
      throw new AppError("Course ID and Chapter ID are required", ErrorType.VALIDATION, { status: 400 });
    }

    const tenantId = await getTenantId();
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const existing = await prisma.chapter.findFirst({
      where: resolveChapterWhere(courseId, chapterIdOrSlug),
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

    const newSlug = await generateUniqueChapterSlug(
      prisma,
      courseId,
      validation.data.title,
      existing.id
    );

    const chapter = await prisma.chapter.update({
      where: { id: existing.id },
      data: {
        title: validation.data.title,
        slug: newSlug,
        position: validation.data.order ?? 0,
      },
    });

    return successResponse({ chapter });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Delete a chapter (cascades to lessons). courseId and chapterId params may be id or slug.
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<CourseChapterParams>
) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const { courseId: courseIdOrSlug, chapterId: chapterIdOrSlug } = await params;
    if (!courseIdOrSlug || !chapterIdOrSlug) {
      throw new AppError("Course ID and Chapter ID are required", ErrorType.VALIDATION, { status: 400 });
    }

    const tenantId = await getTenantId();
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const existing = await prisma.chapter.findFirst({
      where: resolveChapterWhere(courseId, chapterIdOrSlug),
    });
    if (!existing) {
      throw new AppError("Chapter not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    await prisma.chapter.delete({ where: { id: existing.id } });
    return successResponse({ message: "Chapter deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
