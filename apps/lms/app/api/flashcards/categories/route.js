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
import { requireAnyPermission, hasAnyPermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions.js";

const FLASHCARD_READ_PERMS = [
  PERMISSIONS.FLASHCARDS_READ,
  PERMISSIONS.DASHBOARD_ADMIN,
  PERMISSIONS.DASHBOARD_MANAGER,
];

const FLASHCARD_CREATE_PERMS = [
  PERMISSIONS.FLASHCARDS_CREATE,
  PERMISSIONS.DASHBOARD_ADMIN,
  PERMISSIONS.DASHBOARD_MANAGER,
  PERMISSIONS.FLASHCARDS_MANAGE_TENANT,
];

export async function GET() {
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

    const permResult = await requireAnyPermission(FLASHCARD_READ_PERMS, tenantId);
    if (permResult instanceof NextResponse) return permResult;

    const categories = await prisma.flashCardCategory.findMany({
      where: {
        OR: [{ tenantId }, { isGlobal: true }],
      },
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

    const permResult = await requireAnyPermission(FLASHCARD_CREATE_PERMS, tenantId);
    if (permResult instanceof NextResponse) return permResult;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const isAdmin = await hasAnyPermission(
      clerkId,
      [PERMISSIONS.FLASHCARDS_MANAGE_TENANT, PERMISSIONS.DASHBOARD_ADMIN, PERMISSIONS.DASHBOARD_MANAGER],
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
