import { updateStreak } from "@/lib/actions/streak";
import { NextResponse } from "next/server";
import { requireAuth } from "@/utils/auth";

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
    console.error("Auth error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
