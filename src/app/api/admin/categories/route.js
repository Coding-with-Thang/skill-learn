import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAdmin } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

// Get all categories
export async function GET(request) {
    try {
        const adminResult = await requireAdmin();
        if (adminResult instanceof NextResponse) {
            return adminResult;
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

        return successResponse({ categories });
    } catch (error) {
        return handleApiError(error);
    }
}

// Create a new category
export async function POST(request) {
    try {
        const adminResult = await requireAdmin();
        if (adminResult instanceof NextResponse) {
            return adminResult;
        }

        const data = await request.json();

        // Validate required fields
        if (!data.name) {
            throw new AppError("Name is required", ErrorType.VALIDATION, {
                status: 400,
            });
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

        return successResponse({ category });
    } catch (error) {
        return handleApiError(error);
    }
}
