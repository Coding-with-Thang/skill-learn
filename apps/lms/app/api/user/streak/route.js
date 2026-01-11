import { updateStreak } from "@/lib/streak";
import { NextResponse } from "next/server";
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

    const result = await updateStreak(userId);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
