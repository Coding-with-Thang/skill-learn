import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function POST(req) {
  const { userId } = await auth();
  const { categoryId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    //Find or create a categoryStat entry

    let stat = await prisma.categoryStat.findUnique({
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
            userId,
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
    return NextResponse.json({ error: "Error starting quiz" }, { status: 500 });
  }
}
