import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
export async function GET() {
  try {
    //Get users in the db
    const users = await prisma.user.findMany();

    if (!users) {
      return NextResponse.json({ error: "Users not found" }, { status: 404 });
    }

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Error getting users" }, { status: 500 });
  }
}
