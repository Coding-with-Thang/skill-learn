import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { categoryPriorityUserSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant";

/**
 * GET: List all categories with user priorities (default 5 if not set)
 */
export async function GET(_request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const [categories, userPriorities] = await Promise.all([
      prisma.flashCardCategory.findMany({
        where: { tenantId },
        orderBy: { name: "asc" },
        include: { _count: { select: { flashCards: true } } },
      }),
      prisma.categoryPriorityUser.findMany({
        where: { tenantId, userId: user.id },
      }),
    ]);

    const priorityByCat = new Map(userPriorities.map((p) => [p.categoryId, p]));

    const enriched = categories.map((c) => {
      const up = priorityByCat.get(c.id);
      return {
        id: c.id,
        name: c.name,
        cardCount: c._count.flashCards,
        priority: up?.priority ?? 5,
      };
    });

    return successResponse({ categories: enriched });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST: Create or update user category priority (upsert)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const data = await validateRequestBody(req, categoryPriorityUserSchema);

    const exists = await prisma.flashCardCategory.findFirst({
      where: { id: data.categoryId, tenantId },
    });
    if (!exists) {
      throw new AppError("Category not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const record = await prisma.categoryPriorityUser.upsert({
      where: {
        tenantId_userId_categoryId: {
          tenantId,
          userId: user.id,
          categoryId: data.categoryId,
        },
      },
      create: {
        tenantId,
        userId: user.id,
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
