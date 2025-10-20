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
        const { userId } = await auth();
        if (!userId) {
            return {
                status: "error",
                message: "Authentication required",
            };
        }

        const createdCourse = await prisma.course.create({
            data: {
                ...validation.data,
                userId,
            }
        })

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