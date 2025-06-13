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

// Specific audit logging functions for common actions
export const auditActions = {
  // User management
  userCreated: (userId, targetUserId, userDetails) =>
    logAuditEvent(
      userId,
      "create",
      "user",
      targetUserId,
      `Created user: ${userDetails}`
    ),

  userUpdated: (userId, targetUserId, changes) =>
    logAuditEvent(
      userId,
      "update",
      "user",
      targetUserId,
      `Updated user: ${JSON.stringify(changes)}`
    ),

  userDeleted: (userId, targetUserId, userDetails) =>
    logAuditEvent(
      userId,
      "delete",
      "user",
      targetUserId,
      `Deleted user: ${userDetails}`
    ),

  // Points management
  pointsAwarded: (userId, targetUserId, points, reason) =>
    logAuditEvent(
      userId,
      "create",
      "points",
      targetUserId,
      `Awarded ${points} points: ${reason}`
    ),

  pointsDeducted: (userId, targetUserId, points, reason) =>
    logAuditEvent(
      userId,
      "update",
      "points",
      targetUserId,
      `Deducted ${points} points: ${reason}`
    ),

  // Reward management
  rewardCreated: (userId, rewardId, rewardName) =>
    logAuditEvent(
      userId,
      "create",
      "reward",
      rewardId,
      `Created reward: ${rewardName}`
    ),

  rewardRedeemed: (userId, rewardId, rewardName, pointsSpent) =>
    logAuditEvent(
      userId,
      "update",
      "reward",
      rewardId,
      `Redeemed reward: ${rewardName} for ${pointsSpent} points`
    ),

  rewardUpdated: (userId, rewardId, changes) =>
    logAuditEvent(
      userId,
      "update",
      "reward",
      rewardId,
      `Updated reward: ${JSON.stringify(changes)}`
    ),

  // Quiz management
  quizCompleted: (userId, quizId, score, passed) =>
    logAuditEvent(
      userId,
      "create",
      "quiz",
      quizId,
      `Completed quiz with score: ${score}% (${passed ? "Passed" : "Failed"})`
    ),

  quizCreated: (userId, quizId, quizTitle) =>
    logAuditEvent(
      userId,
      "create",
      "quiz",
      quizId,
      `Created quiz: ${quizTitle}`
    ),

  // System settings
  settingUpdated: (userId, settingKey, oldValue, newValue) =>
    logAuditEvent(
      userId,
      "update",
      "setting",
      settingKey,
      `Changed ${settingKey} from "${oldValue}" to "${newValue}"`
    ),

  // Authentication
  userLogin: (userId) =>
    logAuditEvent(userId, "login", "auth", userId, "User logged in"),

  userLogout: (userId) =>
    logAuditEvent(userId, "logout", "auth", userId, "User logged out"),
};
