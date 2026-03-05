import { type NextRequest, NextResponse } from "next/server";
import {
  getAllSystemSettings,
  updateSystemSetting,
} from "@/lib/actions/settings";
import { settingUpdated } from "@skill-learn/lib/utils/auditLogger";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { settingUpdateSchema } from "@/lib/zodSchemas";
import { z } from "zod";

export async function GET() {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const settings = await getAllSystemSettings();
    return successResponse({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { key, value, description } = await validateRequestBody(request, settingUpdateSchema.extend({
      description: z.string().optional(),
    }));

    const setting = await updateSystemSetting(key, value, description);
    await settingUpdated(adminResult.user.id, key, undefined, value, {
      tenantId: adminResult.tenantId || undefined,
      request,
      severity: "high",
      eventDetails: {
        key,
        value,
        description,
        settingId: setting?.id,
      },
    });
    return successResponse({ setting });
  } catch (error) {
    return handleApiError(error);
  }
}
