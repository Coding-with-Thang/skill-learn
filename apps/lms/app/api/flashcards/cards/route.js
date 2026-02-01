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
import { flashCardCreateSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";
import { computeFingerprint } from "@skill-learn/lib/utils/flashCardFingerprint.js";
import { hasAnyPermission } from "@skill-learn/lib/utils/permissions.js";

export async function GET(req) {
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
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const owned = await prisma.flashCard.findMany({
      where: {
        tenantId,
        createdBy: user.id,
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const shared = await prisma.flashCardAccess.findMany({
      where: { tenantId, userId: user.id },
      include: {
        flashCard: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });

    const sharedCards = shared.map((a) => ({
      ...a.flashCard,
      source: "shared",
    }));
    const ownedCards = owned.map((c) => ({ ...c, source: "owned" }));

    return successResponse({
      cards: [...ownedCards, ...sharedCards],
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const data = await validateRequestBody(req, flashCardCreateSchema);

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

    const fingerprint = computeFingerprint(data.question, data.answer);

    const category = await prisma.flashCardCategory.findFirst({
      where: { id: data.categoryId, tenantId },
    });
    if (!category) {
      throw new AppError("Category not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const card = await prisma.flashCard.create({
      data: {
        tenantId,
        categoryId: data.categoryId,
        question: data.question,
        answer: data.answer,
        fingerprint,
        createdBy: user.id,
        createdRole: isAdmin ? "admin" : "user",
        isPublic: data.isPublic ?? false,
        tags: data.tags ?? [],
        difficulty: data.difficulty ?? null,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return successResponse({ card });
  } catch (error) {
    return handleApiError(error);
  }
}
