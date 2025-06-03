import prisma from "@/utils/connect";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = auth();
  const { categoryId } = await req.json();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    let stat = await prisma.categoryStat.findUnique({
      where: {
        userId_categoryId: {
          categoryId,
          userId: user.id,
        },
      },
    });

    if (!stat) {
      stat = await prisma.categoryStat.create({
        data: {
          userId: user.id,
          categoryId,
          attempts: 1,
          lastAttempt: new Date(),
        },
      });
    } else {
      stat = await prisma.categoryStat.update({
        where: {
          userId_categoryId: {
            userId: user.id,
            categoryId,
          },
        },
        data: {
          attempts: stat.attempts + 1,
          lastAttempt: new Date(),
        },
      });
    }

    return NextResponse.json(stat);
  } catch (error) {
    console.error("Start quiz error:", error);
    return new Response("Error starting quiz", { status: 500 });
  }
}
