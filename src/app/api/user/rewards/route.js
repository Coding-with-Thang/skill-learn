import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { handleApiError } from "@/utils/errorHandler";

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
        allowMultiple: true,
        maxRedemptions: true,
      },
    });

    return NextResponse.json({
      rewards,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
