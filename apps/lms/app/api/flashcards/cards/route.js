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

    const permResult = await requireAnyPermission(FLASHCARD_READ_PERMS, tenantId);
    if (permResult instanceof NextResponse) return permResult;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    // Owned cards: user-created in their tenant
    const owned = await prisma.flashCard.findMany({
      where: {
        tenantId,
        createdBy: user.id,
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Shared cards (tenant) + global cards not yet owned
    const shared = await prisma.flashCardAccess.findMany({
      where: { tenantId, userId: user.id },
      include: {
        flashCard: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });

    // Global cards visible to all (exclude already in owned/shared)
    const ownedIds = new Set(owned.map((c) => c.id));
    const sharedIds = new Set(shared.map((a) => a.flashCardId));
    const globalCards = await prisma.flashCard.findMany({
      where: {
        isGlobal: true,
        id: { notIn: [...ownedIds, ...sharedIds] },
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const sharedCards = shared.map((a) => ({
      ...a.flashCard,
      source: "shared",
    }));
    const ownedCards = owned.map((c) => ({ ...c, source: "owned" }));
    const globalCardsList = globalCards.map((c) => ({ ...c, source: "global" }));

    return successResponse({
      cards: [...ownedCards, ...sharedCards, ...globalCardsList],
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
