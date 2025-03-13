import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // check if the user exits in the db
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    //if user does not exist, create a new user

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
        },
      });
    } else {
      console.log("User already exists");
    }

    return NextResponse.json(user);
  } catch (error) {
    console.log("Error starting quiz: ", error);
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}
