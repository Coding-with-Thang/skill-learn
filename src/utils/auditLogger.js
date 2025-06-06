import prisma from "@/utils/connect";

export async function logAuditEvent(
  userId,
  action,
  resource,
  resourceId,
  details
) {
  try {
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
    console.error("Error logging audit event:", error);
  }
}
