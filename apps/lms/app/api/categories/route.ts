import { type NextRequest } from "next/server";
import { prisma } from "@skill-learn/database";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

export async function GET(_request: NextRequest) {
  try {
    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Filter categories by tenant or global content using standardized utility
    // Pattern: (tenantId = userTenantId OR (isGlobal = true AND tenantId IS NULL))
    const whereClause = buildTenantContentFilter(tenantId, {
      isActive: true,
    });

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { quizzes: true },
        },
      },
      where: whereClause,
      orderBy: {
        name: "asc",
      },
    });

    return successResponse({ categories: categories || [] });
  } catch (error) {
    return handleApiError(error);
  }
}
