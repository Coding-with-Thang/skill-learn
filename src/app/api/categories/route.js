import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export async function GET(request) {
  const prisma = new PrismaClient();

  try {
    const categories = await prisma.category.findMany({});
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { error: "There was an error getting Categories" },
      {
        status: 500,
      }
    );
  }
}
