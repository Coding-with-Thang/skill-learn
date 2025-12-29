import {
  getAllSystemSettings,
  updateSystemSetting,
} from "@/lib/actions/settings";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";
import { validateRequestBody } from "@/utils/validateRequest";
import { settingUpdateSchema } from "@/lib/zodSchemas";
import { z } from "zod";

export async function GET() {
  try {
    const settings = await getAllSystemSettings();
    return successResponse({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const { key, value, description } = await validateRequestBody(request, settingUpdateSchema.extend({
      description: z.string().optional(),
    }));

    const setting = await updateSystemSetting(key, value, description);
    return successResponse({ setting });
  } catch (error) {
    return handleApiError(error);
  }
}
