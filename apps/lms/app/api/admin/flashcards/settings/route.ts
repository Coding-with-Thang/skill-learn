import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import {
  handleApiError,
  AppError,
  ErrorType,
} from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { flashCardPrioritySettingsSchema } from "@/lib/zodSchemas";
import { getTenantId } from "@skill-learn/lib/utils/tenant";

/**
 * GET: Fetch FlashCardPrioritySettings (override mode) for tenant
 */
export async function GET() {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const settings = await prisma.flashCardPrioritySettings.findUnique({
      where: { tenantId },
    });

    const overrideMode = settings?.overrideMode ?? "USER_OVERRIDES_ADMIN";

    return successResponse({ settings: { overrideMode } });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH: Update override mode
 */
export async function PATCH(req: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) return adminResult;

    const tenantId = await getTenantId();
    if (!tenantId) {
      throw new AppError("No tenant assigned", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const data = await validateRequestBody(req, flashCardPrioritySettingsSchema);

    const settings = await prisma.flashCardPrioritySettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        overrideMode: data.overrideMode,
      },
      update: { overrideMode: data.overrideMode },
    });

    return successResponse({ settings: { overrideMode: settings.overrideMode } });
  } catch (error) {
    return handleApiError(error);
  }
}
