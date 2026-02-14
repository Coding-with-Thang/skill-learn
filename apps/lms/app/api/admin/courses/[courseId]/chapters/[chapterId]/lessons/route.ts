import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { lessonSchema } from "@/lib/zodSchemas";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { resolveCourseId, generateUniqueLessonSlug } from "@/lib/courses";
import type { RouteContext } from "@/types";

type CourseChapterParams = { courseId: string; chapterId: string };

function resolveChapterWhere(courseId: string, chapterIdOrSlug: string) {
  return /^[a-f0-9]{24}$/i.test(chapterIdOrSlug)
    ? { id: chapterIdOrSlug, courseId }
    : { slug: chapterIdOrSlug, courseId };
}

// GET - List lessons in a chapter. courseId and chapterId params may be id or slug.
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

    return successResponse({ lessons: chapter.lessons });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create a lesson. courseId and chapterId params may be id or slug.
export async function POST(
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

    const chapter = await prisma.chapter.findFirst({
      where: resolveChapterWhere(courseId, chapterIdOrSlug),
    });
    if (!chapter) {
      throw new AppError("Chapter not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const body = await request.json();
    const validation = lessonSchema.safeParse(body);
    if (!validation.success) {
      throw new AppError("Invalid input", ErrorType.VALIDATION, {
        status: 400,
        details: validation.error.flatten(),
      });
    }

    const slug = await generateUniqueLessonSlug(prisma, chapter.id, validation.data.title, undefined);

    const lesson = await prisma.lesson.create({
      data: {
        chapterId: chapter.id,
        title: validation.data.title,
        slug,
        content: validation.data.content ?? "",
        position: validation.data.order ?? 0,
      },
    });

    return successResponse({ lesson });
  } catch (error) {
    return handleApiError(error);
  }
}
