import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Combine queries into a single operation
    const [user, history] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
      }),
      prisma.pointLog.findMany({
        where: {
          user: { clerkId: userId }, // Use nested where clause
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching points history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
