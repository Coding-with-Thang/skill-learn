import { NextResponse } from "next/server";
import {
  getAllSystemSettings,
  updateSystemSetting,
} from "@/lib/actions/settings";

export async function GET() {
  try {
    const settings = await getAllSystemSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error in settings API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { key, value, description } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    const setting = await updateSystemSetting(key, value, description);
    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error in settings API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: error.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
