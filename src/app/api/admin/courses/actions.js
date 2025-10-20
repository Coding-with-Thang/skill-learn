"use server";

import { courseSchema } from "@/lib/zodSchemas";
import prisma from "@/utils/connect";
import { auth } from "@clerk/nextjs/server";

export async function createCourse(data) {
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

        // Get authenticated user id from Clerk (server-side)
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return {
                status: "error",
                message: "Authentication required",
            };
        }

        // Translate Clerk user id to the Prisma User._id (ObjectId string) by looking up by clerkId.
        const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
        if (!dbUser) {
            return {
                status: "error",
                message: "Authenticated user not found in database. Please ensure the user exists in the users collection.",
            };
        }

        // Role-based authorization: only OPERATIONS users may create courses
        if (dbUser.role !== 'OPERATIONS') {
            return {
                status: 'error',
                message: 'Forbidden: insufficient permissions. Only users with the OPERATIONS role can create courses.',
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
            userId: dbUser.id,
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