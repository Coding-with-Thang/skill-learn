import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function PUT(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, featured, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Reward ID is required" },
        { status: 400 }
      );
    }

    // If setting a reward as featured, we need to handle it in a transaction
    if (featured === true) {
      const result = await prisma.$transaction(async (tx) => {
        // First, unset featured flag for all other rewards
        await tx.reward.updateMany({
          where: {
            featured: true,
          },
          data: {
            featured: false,
          },
        });

        // Then set the new featured reward
        const updatedReward = await tx.reward.update({
          where: { id },
          data: { ...updateData, featured: true },
        });

        return updatedReward;
      });

      return NextResponse.json({
        success: true,
        reward: result,
      });
    } else {
      // If not setting as featured, just update the reward normally
      const updatedReward = await prisma.reward.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        reward: updatedReward,
      });
    }
  } catch (error) {
    console.error("Error updating reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
