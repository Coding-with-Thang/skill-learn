import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { chapterSchema } from "@/lib/zodSchemas";
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { resolveCourseId, generateUniqueChapterSlug } from "@/lib/courses.js";

function resolveChapterWhere(courseId, chapterIdOrSlug) {
  return /^[a-f0-9]{24}$/i.test(chapterIdOrSlug)
    ? { id: chapterIdOrSlug, courseId }
    : { slug: chapterIdOrSlug, courseId };
}

// GET - Get a chapter (with lessons). courseId and chapterId params may be id or slug.
export async function GET(request, { params }) {
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
export async function PUT(request, { params }) {
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
        position: validation.data.order ?? validation.data.position ?? 0,
      },
    });

    return successResponse({ chapter });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Delete a chapter (cascades to lessons). courseId and chapterId params may be id or slug.
export async function DELETE(request, { params }) {
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
