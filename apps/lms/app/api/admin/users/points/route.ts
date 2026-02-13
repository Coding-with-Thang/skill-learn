import { NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

export async function GET() {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = adminResult;
    if (!tenantId) {
      return successResponse({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: { tenantId },
    });

    return successResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
