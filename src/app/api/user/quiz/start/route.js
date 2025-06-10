import prisma from "@/utils/connect";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const authRequest = auth();
    const { userId } = await authRequest;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { categoryId } = await req.json();
    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
          attempts: { increment: 1 },
          lastAttempt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, stat });
  } catch (error) {
    console.error("Error starting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
