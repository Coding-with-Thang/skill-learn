import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

// Get a specific category
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

        const { categoryId } = params;

        if (!categoryId) {
            return NextResponse.json(
                { error: "Category ID is required" },
                { status: 400 }
            );
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: { quizzes: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error fetching category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Update a category
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

        const { categoryId } = params;
        const data = await request.json();

        if (!categoryId) {
            return NextResponse.json(
                { error: "Category ID is required" },
                { status: 400 }
            );
        }

        // Update category
        const category = await prisma.category.update({
            where: { id: categoryId },
            data: {
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                isActive: data.isActive,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Delete a category
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

        const { categoryId } = params;

        if (!categoryId) {
            return NextResponse.json(
                { error: "Category ID is required" },
                { status: 400 }
            );
        }

        // Check if category has any quizzes
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: { quizzes: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        if (category._count.quizzes > 0) {
            return NextResponse.json(
                { error: "Cannot delete category with existing quizzes" },
                { status: 400 }
            );
        }

        // Delete category
        await prisma.category.delete({
            where: { id: categoryId },
        });

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
