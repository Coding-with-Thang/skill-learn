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
import { flashCardDeckCreateSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant.js";

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

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    const decks = await prisma.flashCardDeck.findMany({
      where: { tenantId, ownerId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return successResponse({ decks });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const clerkId = authResult;

    const data = await validateRequestBody(req, flashCardDeckCreateSchema);

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

    const deck = await prisma.flashCardDeck.create({
      data: {
        tenantId,
        ownerId: user.id,
        name: data.name,
        description: data.description ?? null,
        cardIds: data.cardIds ?? [],
        categoryIds: data.categoryIds ?? [],
      },
    });

    return successResponse({ deck });
  } catch (error) {
    return handleApiError(error);
  }
}
