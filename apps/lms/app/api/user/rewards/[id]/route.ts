import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { logAuditEvent } from "@skill-learn/lib/utils/auditLogger";
import { validateRequestParams } from "@skill-learn/lib/utils/validateRequest";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";
import { objectIdSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import type { RouteContext } from "@/types";

type RewardIdParams = { id: string };

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<RewardIdParams>
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const { id } = await validateRequestParams(
      z.object({ id: objectIdSchema }),
      params
    );

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
