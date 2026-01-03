import { NextResponse } from "next/server";
import prisma from "@/lib/utils/connect";
import { requireAdmin } from "@/lib/utils/auth";
import { handleApiError } from "@/lib/utils/errorHandler";
import { successResponse } from "@/lib/utils/apiWrapper";

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
