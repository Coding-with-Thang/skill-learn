import { NextResponse } from "next/server";
import {
  getAllSystemSettings,
  updateSystemSetting,
} from "@/lib/actions/settings";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";

export async function GET() {
  try {
    const settings = await getAllSystemSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const { key, value, description } = await request.json();

    if (!key || value === undefined) {
      throw new AppError("Key and value are required", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const setting = await updateSystemSetting(key, value, description);
    return NextResponse.json(setting);
  } catch (error) {
    return handleApiError(error);
  }
}
