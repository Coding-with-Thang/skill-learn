import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      select: {
        id: true,
        prize: true,
        description: true,
        cost: true,
        imageUrl: true,
        featured: true,
        enabled: true,
      },
    });

    if (!rewards) {
      return NextResponse.json({ error: "Rewards not found" }, { status: 404 });
    }

    return NextResponse.json({
      rewards,
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
