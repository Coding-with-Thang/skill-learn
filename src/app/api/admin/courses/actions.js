"use server";

import { courseSchema } from "@/lib/zodSchemas";
import prisma from "@/lib/utils/connect";

/**
 * Create a new course
 * Note: Admin check should be performed at route level before calling this function
 * @param {object} data - Course data to validate
 * @param {string} userId - Database user ID (from requireAdmin result)
 * @returns {Promise<object>} Result object with status, message, and course data
 */
export async function createCourse(data, userId) {
    try {
        const validation = courseSchema.safeParse(data);

        if (!validation.success) {
            // include zod errors for better debugging on the client
            return {
                status: "error",
                message: "Invalid Form Data",
                details: validation.error.flatten(),
            }
        }

        if (!userId) {
            return {
                status: "error",
                message: "User ID is required",
            };
        }

        // Build a clean payload for Prisma. Don't spread validation.data directly
        // because it may contain fields not present on the Course model (e.g. imageUrl).
        const payload = {
            title: validation.data.title,
            description: validation.data.description,
            // fileKey is optional in the schema, but Prisma requires the field
            fileKey: validation.data.fileKey ?? "",
            duration: validation.data.duration,
            categoryId: validation.data.category,
            excerptDescription: validation.data.excerptDescription,
            slug: validation.data.slug,
            status: validation.data.status,
            userId: userId,
        }

        const createdCourse = await prisma.course.create({ data: payload })

        return {
            status: "success",
            message: "Course created successfully",
            course: createdCourse,
        }
    } catch (error) {
        return {
            status: "error",
            message: error?.message || "An error occurred while creating the course",
        }
    }
}