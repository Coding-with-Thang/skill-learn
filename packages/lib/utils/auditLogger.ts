"use server";

import type { NextRequest } from "next/server";
import { logSecurityEvent } from "./security/logger";
import { SECURITY_EVENT_CATEGORIES, SECURITY_EVENT_TYPES } from "./security/eventTypes";
import type {
  SecurityEventOutcome,
  SecurityEventSeverity,
  SecurityRequestContext,
} from "./security/schema";

type AuditLogOptions = {
  eventType?: string;
  category?: string;
  severity?: SecurityEventSeverity;
  outcome?: SecurityEventOutcome;
  riskScore?: number;
  reasonCodes?: string[];
  tenantId?: string | null;
  request?: NextRequest;
  requestContext?: SecurityRequestContext;
  retentionClass?: "standard" | "security_critical" | "legal_hold";
  eventDetails?: unknown;
};

function sanitizeEventSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "") || "unknown";
}

function inferCategory(resource?: string, action?: string): string {
  const normalizedResource = (resource || "").toLowerCase();
  const normalizedAction = (action || "").toLowerCase();

  if (normalizedResource === "auth" || normalizedAction.includes("login") || normalizedAction.includes("logout")) {
    return SECURITY_EVENT_CATEGORIES.AUTH;
  }
  if (normalizedResource === "reward") return SECURITY_EVENT_CATEGORIES.REWARD;
  if (normalizedResource === "points") return SECURITY_EVENT_CATEGORIES.POINTS;
  if (normalizedResource === "setting") return SECURITY_EVENT_CATEGORIES.SETTINGS;
  if (normalizedResource === "user") return SECURITY_EVENT_CATEGORIES.USER_MANAGEMENT;
  return SECURITY_EVENT_CATEGORIES.AUDIT;
}

function inferSeverity(action?: string): SecurityEventSeverity {
  const normalizedAction = (action || "").toLowerCase();
  if (normalizedAction === "delete" || normalizedAction === "error") return "high";
  if (normalizedAction === "update") return "medium";
  return "low";
}

function inferLegacyEventType(action?: string, resource?: string): string {
  const safeResource = sanitizeEventSegment(resource || "resource");
  const safeAction = sanitizeEventSegment(action || "action");
  return `${safeResource}.${safeAction}`;
}

export async function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string | null,
  details?: unknown,
  options: AuditLogOptions = {}
) {
  const message =
    typeof details === "string"
      ? details
      : `Legacy audit event: ${action || "unknown"} ${resource || "unknown"}`.trim();

  await logSecurityEvent({
    actorUserId: userId,
    actorClerkId: userId,
    tenantId: options.tenantId || undefined,
    eventType:
      options.eventType ||
      `${SECURITY_EVENT_TYPES.AUDIT_LEGACY}.${inferLegacyEventType(action, resource)}`,
    category: options.category || inferCategory(resource, action),
    action: action || "unknown",
    resource: resource || "unknown",
    resourceId: resourceId || undefined,
    severity: options.severity || inferSeverity(action),
    outcome: options.outcome || "success",
    riskScore: options.riskScore,
    reasonCodes: options.reasonCodes || [],
    message,
    details: options.eventDetails !== undefined ? options.eventDetails : details,
    requestContext: options.requestContext,
    request: options.request,
    retentionClass: options.retentionClass || "standard",
  });
}

// Specific audit logging functions for common actions
export async function userCreated(userId, targetUserId, userDetails, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "create",
    "user",
    targetUserId,
    `Created user: ${userDetails}`,
    {
      eventType: SECURITY_EVENT_TYPES.USER_CREATED,
      category: SECURITY_EVENT_CATEGORIES.USER_MANAGEMENT,
      severity: "medium",
      eventDetails: { targetUserId, userDetails },
      ...options,
    }
  );
}

export async function userUpdated(userId, targetUserId, changes, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "update",
    "user",
    targetUserId,
    `Updated user: ${JSON.stringify(changes)}`,
    {
      eventType: SECURITY_EVENT_TYPES.USER_UPDATED,
      category: SECURITY_EVENT_CATEGORIES.USER_MANAGEMENT,
      severity: "medium",
      eventDetails: { targetUserId, changes },
      ...options,
    }
  );
}

export async function userDeleted(userId, targetUserId, userDetails, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "delete",
    "user",
    targetUserId,
    `Deleted user: ${userDetails}`,
    {
      eventType: SECURITY_EVENT_TYPES.USER_DELETED,
      category: SECURITY_EVENT_CATEGORIES.USER_MANAGEMENT,
      severity: "high",
      eventDetails: { targetUserId, userDetails },
      ...options,
    }
  );
}

export async function pointsAwarded(userId, points, reason, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "create",
    "points",
    null,
    `Awarded ${points} points: ${reason}`,
    {
      eventType: SECURITY_EVENT_TYPES.POINTS_AWARDED,
      category: SECURITY_EVENT_CATEGORIES.POINTS,
      severity: "medium",
      eventDetails: { points, reason },
      ...options,
    }
  );
}

export async function pointsDeducted(userId, targetUserId, points, reason, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "update",
    "points",
    targetUserId,
    `Deducted ${points} points: ${reason}`,
    {
      eventType: SECURITY_EVENT_TYPES.POINTS_SPENT,
      category: SECURITY_EVENT_CATEGORIES.POINTS,
      severity: "medium",
      eventDetails: { targetUserId, points, reason },
      ...options,
    }
  );
}

export async function rewardCreated(userId, rewardId, rewardName, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "create",
    "reward",
    rewardId,
    `Created reward: ${rewardName}`,
    {
      eventType: SECURITY_EVENT_TYPES.REWARD_CREATED,
      category: SECURITY_EVENT_CATEGORIES.REWARD,
      severity: "medium",
      eventDetails: { rewardId, rewardName },
      ...options,
    }
  );
}

export async function rewardRedeemed(userId, rewardId, rewardName, pointsSpent, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "update",
    "reward",
    rewardId,
    `Redeemed reward: ${rewardName} for ${pointsSpent} points`,
    {
      eventType: SECURITY_EVENT_TYPES.REWARD_REDEEMED,
      category: SECURITY_EVENT_CATEGORIES.REWARD,
      severity: "high",
      eventDetails: { rewardId, rewardName, pointsSpent },
      ...options,
    }
  );
}

export async function rewardUpdated(userId, rewardId, changes, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "update",
    "reward",
    rewardId,
    `Updated reward: ${JSON.stringify(changes)}`,
    {
      eventType: SECURITY_EVENT_TYPES.REWARD_UPDATED,
      category: SECURITY_EVENT_CATEGORIES.REWARD,
      severity: "medium",
      eventDetails: { rewardId, changes },
      ...options,
    }
  );
}

export async function quizCompleted(userId, quizId, score, passed, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "create",
    "quiz",
    quizId,
    `Completed quiz with score: ${score}% (${passed ? "Passed" : "Failed"})`,
    {
      eventType: "quiz.completed",
      category: SECURITY_EVENT_CATEGORIES.API,
      severity: "low",
      eventDetails: { quizId, score, passed },
      ...options,
    }
  );
}

export async function quizCreated(userId, quizId, quizTitle, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "create",
    "quiz",
    quizId,
    `Created quiz: ${quizTitle}`,
    {
      eventType: "quiz.created",
      category: SECURITY_EVENT_CATEGORIES.API,
      severity: "medium",
      eventDetails: { quizId, quizTitle },
      ...options,
    }
  );
}

export async function settingUpdated(userId, settingKey, oldValue, newValue, options: AuditLogOptions = {}) {
  await logAuditEvent(
    userId,
    "update",
    "setting",
    settingKey,
    `Changed ${settingKey} from "${oldValue}" to "${newValue}"`,
    {
      eventType: SECURITY_EVENT_TYPES.SETTINGS_UPDATED,
      category: SECURITY_EVENT_CATEGORIES.SETTINGS,
      severity: "high",
      eventDetails: { settingKey, oldValue, newValue },
      ...options,
    }
  );
}

export async function userLogin(userId, options: AuditLogOptions = {}) {
  await logAuditEvent(userId, "login", "auth", userId, "User logged in", {
    eventType: "auth.login.success",
    category: SECURITY_EVENT_CATEGORIES.AUTH,
    severity: "low",
    ...options,
  });
}

export async function userLogout(userId, options: AuditLogOptions = {}) {
  await logAuditEvent(userId, "logout", "auth", userId, "User logged out", {
    eventType: "auth.logout",
    category: SECURITY_EVENT_CATEGORIES.AUTH,
    severity: "low",
    ...options,
  });
}
