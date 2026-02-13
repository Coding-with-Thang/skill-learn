import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { courseSchema } from "@/lib/zodSchemas";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { requireCanEditCourse } from "@skill-learn/lib/utils/auth";
import { getTenantId } from "@skill-learn/lib/utils/tenant";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getCourseWithChaptersAndLessons, resolveCourseId, isCourseSlugTakenInTenant } from "@/lib/courses";
import type { RouteContext } from "@/types";

type CourseIdParams = { courseId: string };

// Get a specific course (with chapters and lessons). courseId param may be id or slug.
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<CourseIdParams>
) {
  try {
    const { courseId: courseIdOrSlug } = await params;
    if (!courseIdOrSlug) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const tenantId = await getTenantId();
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const course = await getCourseWithChaptersAndLessons(courseId);

    if (!course) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // If the course has a fileKey (uploaded image), generate a signed URL for client preview
    let imageUrl = null;
    try {
      if (course?.fileKey) {
        imageUrl = await getSignedUrl(course.fileKey, 7);
      }
    } catch (err) {
      console.warn(
        "Failed to generate signed URL for course image:",
        err?.message || err,
      );
    }

    // Return course with chapters, lessons, and optional imageUrl for client-side preview
    return successResponse({ course: { ...course, imageUrl } });
  } catch (error) {
    return handleApiError(error);
  }
}

// Update a course. courseId param may be id or slug.
export async function PUT(
  request: NextRequest,
  { params }: RouteContext<CourseIdParams>
) {
  try {
    const { courseId: courseIdOrSlug } = await params;
    if (!courseIdOrSlug) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const tenantId = await getTenantId();
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const data = await request.json();

    const validation = courseSchema.safeParse(data);

    if (!validation.success) {
      throw new AppError("Invalid Form Data", ErrorType.VALIDATION, {
        status: 400,
        details: validation.error.flatten(),
      });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const newSlug = validation.data.slug;
    const slugTaken = await isCourseSlugTakenInTenant({
      slug: newSlug,
      tenantId: existingCourse.tenantId ?? null,
      excludeCourseId: courseId,
    });
    if (slugTaken) {
      throw new AppError("A course with this slug already exists in your organization.", ErrorType.VALIDATION, {
        status: 400,
        details: { fieldErrors: { slug: ["This slug is already in use."] } },
      });
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: validation.data.title,
        description: validation.data.description,
        fileKey: validation.data.fileKey ?? existingCourse.fileKey,
        duration: validation.data.duration,
        categoryId: validation.data.category,
        excerptDescription: validation.data.excerptDescription,
        slug: validation.data.slug,
        status: validation.data.status,
      },
      include: {
        category: true,
      },
    });

    return successResponse({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete a course. courseId param may be id or slug.
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<CourseIdParams>
) {
  try {
    const { courseId: courseIdOrSlug } = await params;
    if (!courseIdOrSlug) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const tenantId = await getTenantId();
    const courseId = await resolveCourseId(courseIdOrSlug, tenantId ?? undefined);
    if (!courseId) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Delete course
    await prisma.course.delete({
      where: { id: courseId },
    });

    return successResponse({
      message: "Course deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
