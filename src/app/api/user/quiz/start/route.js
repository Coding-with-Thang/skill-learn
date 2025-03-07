import { PrismaClient } from "@prisma/client";
import { currentUser, auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function POST(req) {
  const { userId } = await auth();
  const { categoryId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse("User does not exist", { status: 404 });
  }

  try {
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = dbUser.id;

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
    console.log("Error starting quiz: ", error);
    return NextResponse.json({ error: "Error starting quiz" }, { status: 500 });
  }
}
