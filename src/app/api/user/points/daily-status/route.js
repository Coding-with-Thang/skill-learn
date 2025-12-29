import { NextResponse } from "next/server";
import { getDailyPointStatus } from "@/lib/actions/points";
import { requireAuth } from "@/utils/auth";

export async function GET(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    const status = await getDailyPointStatus(request);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error in daily points status API:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      cause: error.cause,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        type: error.constructor.name,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
