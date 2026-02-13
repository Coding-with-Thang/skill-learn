"use server";

import { courseSchema } from "@/lib/zodSchemas";
import { prisma } from '@skill-learn/database';
import { isCourseSlugTakenInTenant } from "@/lib/courses";

/**
 * Create a new course (tenant-scoped).
 * Route must enforce auth and courses.create permission before calling.
 * @param {object} data - Course data to validate
 * @param {string} userId - Database user ID
 * @param {string} [tenantId] - Tenant ID to assign the course to (required for tenant isolation)
 * @returns {Promise<object>} Result object with status, message, and course data
 */
export async function createCourse(data, userId, tenantId = null) {
    try {
        const validation = courseSchema.safeParse(data);

        if (!validation.success) {
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

        const slug = validation.data.slug;
        const taken = await isCourseSlugTakenInTenant({ slug, tenantId: tenantId ?? null });
        if (taken) {
            return {
                status: "error",
                message: "A course with this slug already exists in your organization.",
                details: { fieldErrors: { slug: ["This slug is already in use."] } },
            };
        }

        const payload = {
            title: validation.data.title,
            description: validation.data.description,
            fileKey: validation.data.fileKey ?? "",
            duration: validation.data.duration,
            categoryId: validation.data.category,
            excerptDescription: validation.data.excerptDescription,
            slug,
            status: validation.data.status,
            userId: userId,
            ...(tenantId && { tenantId, isGlobal: false }),
        };

        const createdCourse = await prisma.course.create({ data: payload });

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