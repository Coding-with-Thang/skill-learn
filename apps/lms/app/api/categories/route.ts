import { type NextRequest } from "next/server";
import { prisma } from "@skill-learn/database";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import { getLocaleFromRequest } from "@/lib/localeFromRequest";
import { localizeCategory } from "@/lib/localize";

/**
 * GET /api/categories
 * Pass ?locale=fr or x-locale header for localized names/descriptions.
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const locale = getLocaleFromRequest(request);

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

    const localized = categories.map((c) => localizeCategory(c, locale));
    return successResponse({ categories: localized || [] });
  } catch (error) {
    return handleApiError(error);
  }
}
