import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { points: true, lifetimePoints: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      points: user.points,
      lifetimePoints: user.lifetimePoints,
    });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
