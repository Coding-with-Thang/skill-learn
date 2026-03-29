import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { forcedPasswordCompletionSchema } from "@skill-learn/lib/zodSchemas";
import {
  readMustChangePasswordFlag,
  clearMustChangePasswordFlag,
} from "@skill-learn/lib/utils/clerkTemporaryPassword";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await validateRequestBody(request, forcedPasswordCompletionSchema);
    const client =
      typeof clerkClient === "function" ? await clerkClient() : clerkClient;
    const user = await client.users.getUser(userId);
    const meta = user.publicMetadata as Record<string, unknown> | undefined;
    if (!readMustChangePasswordFlag(meta)) {
      throw new AppError(
        "Your account is not in the required password-change state.",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }

    await client.users.updateUser(userId, {
      password: body.newPassword,
      signOutOfOtherSessions: false,
    });

    await clearMustChangePasswordFlag(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const handled = handleApiError(error);
    return handled;
  }
}
