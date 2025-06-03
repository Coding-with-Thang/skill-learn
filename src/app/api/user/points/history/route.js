import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const history = await prisma.pointLog.findMany({
      where: {
        user: { clerkId: userId },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching points history:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
