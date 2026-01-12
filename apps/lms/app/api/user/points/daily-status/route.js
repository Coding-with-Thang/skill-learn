import { NextResponse } from "next/server";
import { getDailyPointStatus } from "@/lib/points";
import { requireAuth } from "@skill-learn/lib/utils/auth.js";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

export async function GET(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const status = await getDailyPointStatus(request);
    return successResponse(status);
  } catch (error) {
    return handleApiError(error);
  }
}
