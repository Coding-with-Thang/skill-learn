import { updateStreak } from "@/lib/actions/streak";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/auth";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

export async function GET(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const result = await updateStreak(userId);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
