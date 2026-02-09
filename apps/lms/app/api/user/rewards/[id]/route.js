import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth.js";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";
import { logAuditEvent } from "@skill-learn/lib/utils/auditLogger.js";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant.js";
import { objectIdSchema } from "@/lib/zodSchemas";
import { z } from "zod";

export async function DELETE(request, { params }) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { id } = await params;
    z.object({ id: objectIdSchema }).parse({ id });

    const tenantId = await getTenantId();
    const whereClause = buildTenantContentFilter(tenantId);
    const existingReward = await prisma.reward.findFirst({
      where: { id, ...whereClause },
    });

    if (!existingReward) {
      throw new AppError("Reward not found", ErrorType.NOT_FOUND, { status: 404 });
    }

    await prisma.$transaction([
      prisma.rewardLog.deleteMany({ where: { rewardId: id } }),
      prisma.reward.delete({ where: { id } }),
    ]);

    await logAuditEvent(userId, "delete", "reward", id, `Deleted reward: ${existingReward.prize}`);

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
