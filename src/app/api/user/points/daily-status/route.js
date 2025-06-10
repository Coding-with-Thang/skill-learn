import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getDailyPointStatus } from "@/lib/actions/points";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - No user found" },
        { status: 401 }
      );
    }

    const status = await getDailyPointStatus(request);

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error in daily points status API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        type: error.constructor.name,
      },
      { status: 500 }
    );
  }
}
