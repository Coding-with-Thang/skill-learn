import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET(request) {
  try {
    const { userId } = auth(request);

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    //Find the user in the db
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    console.log("User found:", user);

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return new Response("Error getting user", { status: 500 });
  }
}
