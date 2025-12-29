import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { logAuditEvent } from "@/utils/auditLogger";
import { requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";
import { validateRequest } from "@/utils/validateRequest";
import { rewardUpdateSchema, objectIdSchema } from "@/lib/zodSchemas";
import { z } from "zod";

export async function PUT(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const body = await request.json();
    const { id, featured, ...updateData } = body;

    // Validate reward ID
    z.object({ id: objectIdSchema }).parse({ id });

    // Validate update data if provided
    if (Object.keys(updateData).length > 0) {
      await validateRequest(rewardUpdateSchema, updateData);
    }

    // If setting a reward as featured, we need to handle it in a transaction
    if (featured === true) {
      const result = await prisma.$transaction(async (tx) => {
        // First, unset featured flag for all other rewards
        await tx.reward.updateMany({
          where: {
            featured: true,
          },
          data: {
            featured: false,
          },
        });

        // Then set the new featured reward
        const updatedReward = await tx.reward.update({
          where: { id },
          data: { ...updateData, featured: true },
        });

        return updatedReward;
      });

      // Log the audit event
      await logAuditEvent(
        userId,
        "update",
        "reward",
        id,
        `Updated reward: ${updateData.prize} (set as featured)`
      );

      return successResponse({ reward: result });
    } else {
      // If not setting as featured, just update the reward normally
      const updatedReward = await prisma.reward.update({
        where: { id },
        data: updateData,
      });

      // Log the audit event
      await logAuditEvent(
        userId,
        "update",
        "reward",
        id,
        `Updated reward: ${updateData.prize}`
      );

      return successResponse({ reward: updatedReward });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
