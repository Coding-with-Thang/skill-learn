import { updateStreak } from "@/lib/actions/streak";
import { NextResponse } from "next/server";
import { requireAuth } from "@/utils/auth";
import { handleApiError } from "@/utils/errorHandler";

export async function GET(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const result = await updateStreak(userId);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
