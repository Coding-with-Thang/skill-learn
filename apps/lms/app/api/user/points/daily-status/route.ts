import { type NextRequest, NextResponse } from "next/server";
import { getDailyPointStatus } from "@/lib/points";
import { requireAuth } from "@skill-learn/lib/utils/auth";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

export async function GET(request: NextRequest) {
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
