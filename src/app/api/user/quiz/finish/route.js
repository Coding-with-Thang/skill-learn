import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

export async function POST(NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const prisma = new PrismaClient();

    console.log("User?: ", user);

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
