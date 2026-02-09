import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAdmin } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { categoryCreateSchema } from "@/lib/zodSchemas";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant.js";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage.js";

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

        // Fetch all categories with quiz and course counts (filtered by tenant)
        const rows = await prisma.category.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { quizzes: true, courses: true },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        // Resolve imageUrl from fileKey when present (signed URL)
        const categories = await Promise.all(
            rows.map(async (c) => {
                let imageUrl = c.imageUrl ?? null;
                if (c.fileKey) {
                    const url = await getSignedUrl(c.fileKey, 7);
                    if (url) imageUrl = url;
                }
                return { ...c, imageUrl };
            })
        );

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
                fileKey: data.fileKey ?? undefined,
                isActive: data.isActive ?? true,
                tenantId: tenantId ?? undefined,
                isGlobal: tenantId ? false : true,
            },
        });

        return successResponse({ category });
    } catch (error) {
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "A category with this name already exists." },
                { status: 400 }
            );
        }
        return handleApiError(error);
    }
}
