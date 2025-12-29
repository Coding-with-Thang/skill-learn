import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { handleApiError } from "@/utils/errorHandler";
export async function GET() {
  try {
    //Get users in the db
    const users = await prisma.user.findMany();

    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error);
  }
}
