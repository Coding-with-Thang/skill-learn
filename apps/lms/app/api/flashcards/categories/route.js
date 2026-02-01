import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth.js";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest.js";
import { flashCardCategoryCreateSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";
import { hasAnyPermission } from "@skill-learn/lib/utils/permissions.js";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const categories = await prisma.flashCardCategory.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { flashCards: true } },
      },
    });

    return successResponse({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const data = await validateRequestBody(req, flashCardCategoryCreateSchema);

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
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const isAdmin = await hasAnyPermission(
      clerkId,
      ["dashboard.admin", "dashboard.manager", "settings.update"],
      tenantId
    );

    const category = await prisma.flashCardCategory.create({
      data: {
        tenantId,
        name: data.name,
        createdBy: user.id,
        isSystem: isAdmin && (data.isSystem ?? false),
      },
    });

    return successResponse({ category });
  } catch (error) {
    return handleApiError(error);
  }
}
