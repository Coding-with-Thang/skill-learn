import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { courseSchema, objectIdSchema } from "@/lib/zodSchemas";
import { getSignedUrl } from "@/utils/adminStorage";
import { requireAdmin } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";
import { validateRequestBody, validateRequestParams } from "@/utils/validateRequest";
import { z } from "zod";

// Get a specific course
export async function GET(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { courseId } = await params;

    if (!courseId) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
      },
    });

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
        err?.message || err
      );
    }

    // Return course with optional imageUrl for client-side preview
    return successResponse({ course: { ...course, imageUrl } });
  } catch (error) {
    return handleApiError(error);
  }
}

// Update a course
export async function PUT(request, { params }) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { courseId } = await params;
    const data = await request.json();

    if (!courseId) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

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
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { courseId } = await params;

    if (!courseId) {
      throw new AppError("Course ID is required", ErrorType.VALIDATION, {
        status: 400,
      });
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
