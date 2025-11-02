import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { courseSchema } from "@/lib/zodSchemas";

// Get a specific course
export async function GET(request, { params }) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true },
        });

        if (!user || user.role !== "OPERATIONS") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { courseId } = params;

        if (!courseId) {
            return NextResponse.json(
                { error: "Course ID is required" },
                { status: 400 }
            );
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                category: true,
            },
        });

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(course);
    } catch (error) {
        console.error("Error fetching course:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Update a course
export async function PUT(request, { params }) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true },
        });

        if (!user || user.role !== "OPERATIONS") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { courseId } = params;
        const data = await request.json();

        if (!courseId) {
            return NextResponse.json(
                { error: "Course ID is required" },
                { status: 400 }
            );
        }

        // Validate the data
        const validation = courseSchema.safeParse(data);

        if (!validation.success) {
            return NextResponse.json(
                {
                    status: "error",
                    message: "Invalid Form Data",
                    details: validation.error.flatten(),
                },
                { status: 400 }
            );
        }

        // Check if course exists
        const existingCourse = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!existingCourse) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
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

        return NextResponse.json({
            status: "success",
            message: "Course updated successfully",
            course,
        });
    } catch (error) {
        console.error("Error updating course:", error);
        return NextResponse.json(
            {
                status: "error",
                message: error?.message || "Internal server error",
            },
            { status: 500 }
        );
    }
}

// Delete a course
export async function DELETE(request, { params }) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true },
        });

        if (!user || user.role !== "OPERATIONS") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { courseId } = params;

        if (!courseId) {
            return NextResponse.json(
                { error: "Course ID is required" },
                { status: 400 }
            );
        }

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        // Delete course
        await prisma.course.delete({
            where: { id: courseId },
        });

        return NextResponse.json({
            status: "success",
            message: "Course deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting course:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

