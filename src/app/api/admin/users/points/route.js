import prisma from "@/utils/connect";
import { handleApiError } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

export async function GET() {
  try {
    //Get users in the db
    const users = await prisma.user.findMany();

    return successResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
