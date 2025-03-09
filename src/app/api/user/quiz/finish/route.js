import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { currentUser, auth } from "@clerk/nextjs/server";

export async function POST(NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const prisma = new PrismaClient();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.log("error finishing quiz: ", error);
    return NextResponse.json(
      { error: "Error finishing quiz" },
      { status: 500 }
    );
  }
}
