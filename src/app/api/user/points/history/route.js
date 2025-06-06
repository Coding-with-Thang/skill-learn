import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get points history
    const history = await prisma.pointLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to last 50 entries
      select: {
        id: true,
        amount: true,
        reason: true,
        createdAt: true,
      },
    });

    // Get points summary
    const summary = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        points: true,
        lifetimePoints: true,
      },
    });

    // Get today's points
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysPoints = await prisma.pointLog.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      history,
      summary: {
        currentPoints: summary?.points || 0,
        lifetimePoints: summary?.lifetimePoints || 0,
        todaysPoints: todaysPoints._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching points history:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
