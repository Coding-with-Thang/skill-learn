import prisma from "@/utils/connect";
import { AppError, ErrorType } from "@/utils/errorHandler";

export async function logAuditEvent(
  userId,
  action,
  resource,
  resourceId,
  details
) {
  try {
    // Validate inputs
    if (!userId || !action || !resource) {
      throw new AppError(
        "Missing required audit log fields",
        ErrorType.VALIDATION,
        { userId, action, resource }
      );
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details,
      },
    });
  } catch (error) {
    // We don't want audit logging failures to break the application
    // Just log the error and continue
    console.error(
      "Audit logging failed:",
      error instanceof AppError ? error.message : error
    );
  }
}
