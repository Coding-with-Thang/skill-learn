import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

// Get all categories
export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify admin role
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true },
        });

        if (!user || user.role !== "OPERATIONS") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Fetch all categories with quiz count
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { quizzes: true },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Create a new category
export async function POST(request) {
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

        const data = await request.json();

        // Validate required fields
        if (!data.name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Create new category
        const category = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                isActive: data.isActive ?? true,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
