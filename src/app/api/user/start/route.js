import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

export async function POST(NextRequest) {
  const prisma = new PrismaClient();
  const { userId } = await auth();
  const { categoryId } = await NextRequest.json();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = user.id;

    //Find or create a categoryStat entry
    let stat = await prisma.categoryStat.find({
      where: {
        userId_categoryId: {
          categoryId,
          userId,
        },
      },
    });

    if (!stat) {
      stat = await prisma.categoryStat.create({
        data: {
          userId,
          categoryId,
          attempts: 1,
          lastAttempt: new Date(),
        },
      });
    } else {
      await prisma.categoryStat.update({
        where: {
          userId_categoryId: {
            categoryId,
            userId,
          },
        },
        data: { attempts: stat.attempts + 1, lastAttempt: new Date() },
      });
    }
  } catch (error) {
    console.log("Error starting quiz: ", error);
    return NextResponse.json({ error: "Error starting quiz" }, { status: 500 });
  }
}
