import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { requireAdmin } from "@/utils/auth";
import { handleApiError } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

export async function GET() {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    //Get users in the db
    const users = await prisma.user.findMany();

    return successResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
