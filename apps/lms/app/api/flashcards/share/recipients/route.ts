import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { getTenantContext } from "@skill-learn/lib/utils/tenant";
import { requireAnyPermission, PERMISSIONS } from "@skill-learn/lib/utils/permissions";

const FLASHCARD_READ_PERMS = [
  PERMISSIONS.FLASHCARDS_READ,
  PERMISSIONS.DASHBOARD_ADMIN,
  PERMISSIONS.DASHBOARD_MANAGER,
];

/**
 * GET: List tenant users for deck share recipient picker
 * Returns id, username (excluding current user)
 */
export async function GET(_request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const context = await getTenantContext();
    if (context instanceof NextResponse) return context;

    const permResult = await requireAnyPermission(FLASHCARD_READ_PERMS, context.tenantId);
    if (permResult instanceof NextResponse) return permResult;

    const { tenantId, user } = context;

    const users = await prisma.user.findMany({
      where: {
        tenantId,
        id: { not: user.id },
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { username: "asc" },
    });

    const recipients = users.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username,
    }));

    return successResponse({
      recipients,
      total: recipients.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
