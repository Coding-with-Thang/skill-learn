import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET() {
  try {
    const quizzesPerCategory = await prisma.quiz.groupBy({
      by: ['categoryId'],
      _count: {
        id: true,
      },
    });

    return NextResponse.json(quizzesPerCategory);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
