import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
export async function GET() {

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
