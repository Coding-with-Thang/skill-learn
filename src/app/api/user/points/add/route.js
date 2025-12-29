import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";
import { pointsAwarded } from "@/utils/auditLogger";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, reason } = await request.json();

    if (!amount || !reason) {
      return NextResponse.json(
        { error: "Reason and Amount required!" },
        { status: 400 }
      );
    }

    // Transaction to update points and create log
    const result = await prisma.$transaction(async (tx) => {
      // Update user points
      const updatedUser = await tx.user.update({
        where: { clerkId: userId },
        data: {
          points: { increment: amount },
          lifetimePoints: { increment: amount },
        },
        select: { id: true, points: true, lifetimePoints: true },
      });

      // Create point log
      await tx.pointLog.create({
        data: {
          userId: updatedUser.id,
          amount,
          reason,
        },
      });

      return updatedUser;
    });

    await pointsAwarded(userId, amount, reason);

    return NextResponse.json({
      success: true,
      points: result.points,
      lifetimePoints: result.lifetimePoints,
    });
  } catch (error) {
    console.error("Error adding points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
