import { NextResponse } from "next/server";
import { getDailyPointStatus } from "@/lib/actions/points";
import { requireAuth } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";

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
