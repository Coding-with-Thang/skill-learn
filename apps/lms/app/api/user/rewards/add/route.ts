import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { logAuditEvent } from "@skill-learn/lib/utils/auditLogger";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequest } from "@skill-learn/lib/utils/validateRequest";
import { rewardCreateSchema } from "@/lib/zodSchemas";
import { getSignedUrl } from "@skill-learn/lib/utils/adminStorage";
import { getTenantId } from "@skill-learn/lib/utils/tenant";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const body = await request.json();
    
    // Validate the request body
    await validateRequest(rewardCreateSchema, body);

    // Get current user's tenantId using standardized utility
    const tenantId = await getTenantId();

    // Generate signed URL if fileKey exists
    let imageUrl = body.imageUrl || null;
    try {
      if (body.fileKey) {
        const signedUrl = await getSignedUrl(body.fileKey, 7);
        if (signedUrl) imageUrl = signedUrl;
      }
    } catch (err) {
      console.warn(
        "Failed to generate signed URL for reward image:",
        err instanceof Error ? err.message : err
      );
    }

    // Create the reward
    const reward = await prisma.reward.create({
      data: {
        prize: body.prize,
        description: body.description,
        cost: body.cost,
        imageUrl: imageUrl,
        fileKey: body.fileKey,
        tenantId: tenantId, // Assign to current user's tenant
        isGlobal: body.isGlobal ?? false, // Allow admin to set global flag
        enabled: body.enabled ?? true,
        allowMultiple: body.allowMultiple ?? false,
        maxRedemptions: body.maxRedemptions ?? 1,
        claimUrl: body.claimUrl,
      },
    });

    // Log the audit event
    await logAuditEvent(
      userId,
      "create",
      "reward",
      reward.id,
      `Created reward: ${reward.prize}`
    );

    return successResponse({ reward });
  } catch (error) {
    return handleApiError(error);
  }
}
