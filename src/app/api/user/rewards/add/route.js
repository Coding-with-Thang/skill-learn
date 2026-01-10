import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";
import { logAuditEvent } from "@/lib/utils/auditLogger";
import { requireAuth } from "@/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";
import { validateRequest } from "@/lib/utils/validateRequest";
import { rewardCreateSchema } from "@/lib/zodSchemas";
import { getSignedUrl } from "@/lib/utils/adminStorage";

export async function POST(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const body = await request.json();
    
    // Validate the request body
    await validateRequest(rewardCreateSchema, body);

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
        err?.message || err
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
