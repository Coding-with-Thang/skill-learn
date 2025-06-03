import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(req, { params }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { categoryId } = params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const stats = await prisma.categoryStat.findUnique({
      where: {
        userId_categoryId: {
          userId: user.id,
          categoryId,
        },
      },
      select: {
        attempts: true,
        completed: true,
        averageScore: true,
        bestScore: true,
        lastAttempt: true,
      },
    });

    return NextResponse.json(
      stats || {
        attempts: 0,
        completed: 0,
        averageScore: null,
        bestScore: null,
        lastAttempt: null,
      }
    );
  } catch (error) {
    console.error("Error fetching quiz stats:", error);
    return new Response("Error fetching quiz stats", { status: 500 });
  }
}
