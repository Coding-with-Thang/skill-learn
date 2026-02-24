export const SECURITY_EVENT_CATEGORIES = {
  AUTH: "auth",
  RBAC: "rbac",
  USER_MANAGEMENT: "user_management",
  REWARD: "reward",
  POINTS: "points",
  SETTINGS: "settings",
  WEBHOOK: "webhook",
  AUDIT: "audit",
  API: "api",
} as const;

export type SecurityEventCategory =
  (typeof SECURITY_EVENT_CATEGORIES)[keyof typeof SECURITY_EVENT_CATEGORIES];

export const SECURITY_EVENT_TYPES = {
  AUDIT_LEGACY: "audit.legacy",
  AUDIT_MANUAL: "audit.manual",

  AUTH_SESSION_CREATED: "auth.session.created",
  AUTH_REQUEST_UNAUTHORIZED: "auth.request.unauthorized",

  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",
  USER_REPORTS_TO_CHANGED: "user.reports_to_changed",

  RBAC_ROLE_CREATED: "rbac.role.created",
  RBAC_ROLE_UPDATED: "rbac.role.updated",
  RBAC_ROLE_DELETED: "rbac.role.deleted",
  RBAC_ROLE_TEMPLATE_INITIALIZED: "rbac.role.template_initialized",
  RBAC_ROLE_ASSIGNED: "rbac.role.assigned",
  RBAC_ROLE_UNASSIGNED: "rbac.role.unassigned",

  SETTINGS_UPDATED: "settings.updated",

  POINTS_AWARDED: "points.awarded",
  POINTS_SPENT: "points.spent",

  REWARD_CREATED: "reward.created",
  REWARD_UPDATED: "reward.updated",
  REWARD_DELETED: "reward.deleted",
  REWARD_REDEEMED: "reward.redeemed",

  WEBHOOK_VERIFICATION_FAILED: "webhook.verification.failed",
  WEBHOOK_PROCESSING_FAILED: "webhook.processing.failed",
} as const;

export type SecurityEventType =
  (typeof SECURITY_EVENT_TYPES)[keyof typeof SECURITY_EVENT_TYPES];
