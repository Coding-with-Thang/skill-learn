import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAdmin } from "@/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { categoryCreateSchema } from "@/lib/zodSchemas";

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

        const data = await validateRequestBody(request, categoryCreateSchema);

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
