import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      status: "success",
      message: "Test endpoint is working",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
