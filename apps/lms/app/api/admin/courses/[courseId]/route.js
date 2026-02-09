import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { courseSchema } from "@/lib/zodSchemas";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage.js";
import { requireCanEditCourse } from "@skill-learn/lib/utils/auth.js";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { getCourseWithChaptersAndLessons } from "@/lib/courses.js";

// Get a specific course (with chapters and lessons)
export async function GET(request, { params }) {
  try {
    const { courseId } = await params;
    if (!courseId) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, {
        status: 400,
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

// Update a course
export async function PUT(request, { params }) {
  try {
    const { courseId } = await params;
    if (!courseId) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }
    const authResult = await requireCanEditCourse(courseId);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const data = await request.json();

    // Validate the data
    const validation = courseSchema.safeParse(data);

    if (!validation.success) {
      throw new AppError("Invalid Form Data", ErrorType.VALIDATION, {
        status: 400,
        details: validation.error.flatten(),
      });
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      throw new AppError("Course not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    // Update course
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

// Delete a course
export async function DELETE(request, { params }) {
  try {
    const { courseId } = await params;
    if (!courseId) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, {
        status: 400,
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
