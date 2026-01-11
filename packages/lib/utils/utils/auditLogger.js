"use server";
// This module is server-only because it uses Prisma
import { prisma } from '@skill-learn/database';
import { AppError, ErrorType } from "../../utils/errorHandler";

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
export async function userCreated(userId, targetUserId, userDetails) {
  await logAuditEvent(
    userId,
    "create",
    "user",
    targetUserId,
    `Created user: ${userDetails}`
  );
}

export async function userUpdated(userId, targetUserId, changes) {
  await logAuditEvent(
    userId,
    "update",
    "user",
    targetUserId,
    `Updated user: ${JSON.stringify(changes)}`
  );
}

export async function userDeleted(userId, targetUserId, userDetails) {
  await logAuditEvent(
    userId,
    "delete",
    "user",
    targetUserId,
    `Deleted user: ${userDetails}`
  );
}

export async function pointsAwarded(userId, points, reason) {
  await logAuditEvent(
    userId,
    "create",
    "points",
    `Awarded ${points} points: ${reason}`
  );
}

export async function pointsDeducted(userId, targetUserId, points, reason) {
  await logAuditEvent(
    userId,
    "update",
    "points",
    targetUserId,
    `Deducted ${points} points: ${reason}`
  );
}

export async function rewardCreated(userId, rewardId, rewardName) {
  await logAuditEvent(
    userId,
    "create",
    "reward",
    rewardId,
    `Created reward: ${rewardName}`
  );
}

export async function rewardRedeemed(userId, rewardId, rewardName, pointsSpent) {
  await logAuditEvent(
    userId,
    "update",
    "reward",
    rewardId,
    `Redeemed reward: ${rewardName} for ${pointsSpent} points`
  );
}

export async function rewardUpdated(userId, rewardId, changes) {
  await logAuditEvent(
    userId,
    "update",
    "reward",
    rewardId,
    `Updated reward: ${JSON.stringify(changes)}`
  );
}

export async function quizCompleted(userId, quizId, score, passed) {
  await logAuditEvent(
    userId,
    "create",
    "quiz",
    quizId,
    `Completed quiz with score: ${score}% (${passed ? "Passed" : "Failed"})`
  );
}

export async function quizCreated(userId, quizId, quizTitle) {
  await logAuditEvent(
    userId,
    "create",
    "quiz",
    quizId,
    `Created quiz: ${quizTitle}`
  );
}

export async function settingUpdated(userId, settingKey, oldValue, newValue) {
  await logAuditEvent(
    userId,
    "update",
    "setting",
    settingKey,
    `Changed ${settingKey} from "${oldValue}" to "${newValue}"`
  );
}

export async function userLogin(userId) {
  await logAuditEvent(userId, "login", "auth", userId, "User logged in");
}

export async function userLogout(userId) {
  await logAuditEvent(userId, "logout", "auth", userId, "User logged out");
}
