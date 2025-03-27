import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
export async function GET() {
  try {
    const users = await prisma.user.findMany();

    if (!users) {
      return NextResponse.json({ error: "Users not found" }, { status: 404 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
