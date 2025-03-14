import { NextResponse } from "next/server";
import {
  awardDailyPoints,
  getDailyPointStatus,
} from "../../../lib/actions/points";
export async function GET() {
  try {
    const status = await getDailyPointStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    const { amount, reason } = await req.json();

    if (!amount || !reason) {
      return NextResponse.json(
        { error: "Amount and reason are required" },
        { status: 400 }
      );
    }

    const result = await awardDailyPoints(amount, reason);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
