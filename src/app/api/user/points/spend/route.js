import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, reason } = await request.json();

    if (!amount || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has enough points
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, points: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.points < amount) {
      return NextResponse.json(
        {
          error: "Insufficient points",
          points: user.points,
        },
        { status: 400 }
      );
    }

    // Transaction to update points and create log
    const result = await prisma.$transaction(async (tx) => {
      // Update user points
      const updatedUser = await tx.user.update({
        where: { clerkId: userId },
        data: {
          points: { decrement: amount },
        },
        select: { id: true, points: true, lifetimePoints: true },
      });

      // Create point log for spending (negative amount)
      await tx.pointLog.create({
        data: {
          userId: updatedUser.id,
          amount: -amount,
          reason: `points_spent_${reason}`,
        },
      });

      return updatedUser;
    });

    return NextResponse.json({
      success: true,
      points: result.points,
      lifetimePoints: result.lifetimePoints,
    });
  } catch (error) {
    console.error("Error spending points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
