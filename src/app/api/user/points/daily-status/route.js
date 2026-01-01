import { NextResponse } from "next/server";
import { getDailyPointStatus } from "@/lib/actions/points";
import { requireAuth } from "@/utils/auth";
import { handleApiError } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

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
