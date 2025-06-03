import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const history = await prisma.rewardLog.findMany({
      where: { userId: user.id },
      include: {
        reward: {
          select: {
            prize: true,
            description: true,
            imageUrl: true,
            claimUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching reward history:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
