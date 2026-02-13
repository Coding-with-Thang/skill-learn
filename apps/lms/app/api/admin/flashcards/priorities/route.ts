import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { categoryPriorityAdminSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant";

/**
 * GET: List all categories with admin priorities (default 5 if not set)
 */
export async function GET() {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const [categories, adminPriorities] = await Promise.all([
      prisma.flashCardCategory.findMany({
        where: { tenantId },
        orderBy: { name: "asc" },
        include: { _count: { select: { flashCards: true } } },
      }),
      prisma.categoryPriorityAdmin.findMany({
        where: { tenantId },
      }),
    ]);

    const priorityByCat = new Map(adminPriorities.map((p) => [p.categoryId, p]));

    const enriched = categories.map((c) => {
      const ap = priorityByCat.get(c.id);
      return {
        id: c.id,
        name: c.name,
        cardCount: c._count.flashCards,
        priority: ap?.priority ?? 5,
        priorityRecordId: ap?.id,
      };
    });

    return successResponse({ categories: enriched });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST: Create or update category priority (upsert)
 */
export async function POST(req: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const data = await validateRequestBody(req, categoryPriorityAdminSchema);

    const exists = await prisma.flashCardCategory.findFirst({
      where: { id: data.categoryId, tenantId },
    });
    if (!exists) {
      throw new AppError("Category not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const record = await prisma.categoryPriorityAdmin.upsert({
      where: {
        tenantId_categoryId: { tenantId, categoryId: data.categoryId },
      },
      create: {
        tenantId,
        categoryId: data.categoryId,
        priority: data.priority,
      },
      update: { priority: data.priority },
    });

    return successResponse({ priority: record });
  } catch (error) {
    return handleApiError(error);
  }
}
