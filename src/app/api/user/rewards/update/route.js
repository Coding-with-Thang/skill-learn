import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";
import { logAuditEvent } from "@/lib/utils/auditLogger";
import { requireAuth } from "@/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";
import { validateRequest } from "@/lib/utils/validateRequest";
import { rewardUpdateSchema, objectIdSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { getSignedUrl } from "@/lib/utils/adminStorage";

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

    // Generate signed URL if fileKey exists
    let imageUrl = updateData.imageUrl;
    if (updateData.fileKey) {
      try {
        const signedUrl = await getSignedUrl(updateData.fileKey, 7);
        if (signedUrl) imageUrl = signedUrl;
      } catch (err) {
        console.warn(
          "Failed to generate signed URL for reward image:",
          err?.message || err
        );
      }
    }

    // Update updateData with the signed URL if fileKey was provided
    if (updateData.fileKey && imageUrl) {
      updateData.imageUrl = imageUrl;
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
