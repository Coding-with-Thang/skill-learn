import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { logAuditEvent } from "@skill-learn/lib/utils/auditLogger";
import { SECURITY_EVENT_CATEGORIES, SECURITY_EVENT_TYPES } from "@skill-learn/lib/utils/security/eventTypes";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequest } from "@skill-learn/lib/utils/validateRequest";
import { rewardUpdateSchema, objectIdSchema } from "@/lib/zodSchemas";
import { z } from "zod";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { getTenantId, buildTenantContentFilter } from "@skill-learn/lib/utils/tenant";

export async function PUT(request: NextRequest) {
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

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // CRITICAL: Verify reward belongs to tenant before updating
    const whereClause = buildTenantContentFilter(tenantId);
    const existingReward = await prisma.reward.findFirst({
      where: { 
        id,
        ...whereClause,
      },
    });

    if (!existingReward) {
      throw new AppError("Reward not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
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
          err instanceof Error ? err.message : err
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
        // First, unset featured flag for all other rewards in the same tenant
        await tx.reward.updateMany({
          where: {
            featured: true,
            ...whereClause,
          },
          data: {
            featured: false,
          },
        });

        // Then set the new featured reward
        const updatedReward = await tx.reward.update({
          where: { id },
          data: { 
            ...updateData, 
            featured: true,
            tenantId: updateData.tenantId !== undefined ? updateData.tenantId : existingReward.tenantId,
            isGlobal: updateData.isGlobal !== undefined ? updateData.isGlobal : existingReward.isGlobal,
          },
        });

        return updatedReward;
      });

      // Log the audit event
      await logAuditEvent(
        userId,
        "update",
        "reward",
        id,
        `Updated reward: ${updateData.prize} (set as featured)`,
        {
          eventType: SECURITY_EVENT_TYPES.REWARD_UPDATED,
          category: SECURITY_EVENT_CATEGORIES.REWARD,
          severity: "medium",
          tenantId,
          request,
          eventDetails: {
            rewardId: id,
            featured: true,
            changes: updateData,
          },
        }
      );

      return successResponse({ reward: result });
    } else {
      // If not setting as featured, just update the reward normally
      const updatedReward = await prisma.reward.update({
        where: { id },
        data: {
          ...updateData,
          tenantId: updateData.tenantId !== undefined ? updateData.tenantId : existingReward.tenantId,
          isGlobal: updateData.isGlobal !== undefined ? updateData.isGlobal : existingReward.isGlobal,
        },
      });

      // Log the audit event
      await logAuditEvent(
        userId,
        "update",
        "reward",
        id,
        `Updated reward: ${updateData.prize}`,
        {
          eventType: SECURITY_EVENT_TYPES.REWARD_UPDATED,
          category: SECURITY_EVENT_CATEGORIES.REWARD,
          severity: "medium",
          tenantId,
          request,
          eventDetails: {
            rewardId: id,
            featured: false,
            changes: updateData,
          },
        }
      );

      return successResponse({ reward: updatedReward });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
