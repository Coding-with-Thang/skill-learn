import prisma from "@/utils/connect";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = await auth();
  const { categoryId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }, // Fixed: use userId from auth
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use user.id directly instead of redeclaring userId
    let stat = await prisma.categoryStat.findUnique({
      where: {
        userId_categoryId: {
          categoryId,
          userId: user.id, // Use user.id directly
        },
      },
    });

    if (!stat) {
      stat = await prisma.categoryStat.create({
        data: {
          userId: user.id, // Use user.id directly
          categoryId,
          attempts: 1,
          lastAttempt: new Date(),
        },
      });
    } else {
      stat = await prisma.categoryStat.update({ // Assign the result back to stat
        where: {
          userId_categoryId: {
            userId: user.id, // Use user.id directly
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
    console.error("Start quiz error:", error); // Add logging to see the actual error
    return NextResponse.json({ error: "Error starting quiz" }, { status: 500 });
  }
}