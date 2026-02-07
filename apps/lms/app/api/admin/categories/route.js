import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { categoryCreateSchema } from "@/lib/zodSchemas";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant.js";

// Get all categories
export async function GET(request) {
    try {
        const adminResult = await requireAdmin();
        if (adminResult instanceof NextResponse) {
            return adminResult;
        }

        // Get current user's tenantId using standardized utility
        const tenantId = await getTenantId();

        // CRITICAL: Filter categories by tenant or global content using standardized utility
        const whereClause = buildTenantContentFilter(tenantId);

        // Fetch all categories with quiz count (filtered by tenant)
        const categories = await prisma.category.findMany({
            where: whereClause,
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

        // Get current user's tenantId using standardized utility
        const tenantId = await getTenantId();

        // Create new category (assigned to current tenant, not global)
        const category = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                isActive: data.isActive ?? true,
                tenantId: tenantId ?? undefined,
                isGlobal: tenantId ? false : true,
            },
        });

        return successResponse({ category });
    } catch (error) {
        return handleApiError(error);
    }
}
