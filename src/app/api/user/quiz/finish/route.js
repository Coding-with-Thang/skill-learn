import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { categoryId, quizId, score, responses } = await req.json();

    //Validate the fields
    if (
      !categoryId ||
      !quizId ||
      typeof score !== "number" ||
      !Array.isArray(responses)
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    //Fetch or create a categoryStat entry
    let stat = await prisma.categoryStat.findUnique({
      where: {
        userId_categoryId: {
          userId: user.id,
          categoryId,
        },
      },
    });

    if (stat) {
      //Calculate the average score
      const totalScore = (stat.averageScore || 0) * stat.completed + score;
      const newAverageScore = totalScore / (stat.completed + 1);

      //Update the categoryStat entry
      stat = await prisma.categoryStat.update({
        where: { id: stat.id },
        data: {
          completed: stat.completed + 1,
          averageScore: newAverageScore,
          lastAttempt: new Date(),
        },
      });
    } else {
      //Create a new categoryStat entry
      stat = await prisma.categoryStat.create({
        data: {
          userId: user.id,
          categoryId,
          attempts: 1,
          completed: 1,
          averageScore: score,
          lastAttempt: new Date(),
        },
      });
    }

    return NextResponse.json(stat);
  } catch (error) {
    return NextResponse.json(
      { error: "Error finishing quiz" },
      { status: 500 }
    );
  }
}
