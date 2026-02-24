import { SECURITY_EVENT_TYPES } from "./eventTypes";

export type SecurityEventGuardrailInput = {
  eventType: string;
  actorUserId?: string | null;
  actorClerkId?: string | null;
  tenantId?: string | null;
  resource?: string | null;
  resourceId?: string | null;
  message?: string | null;
  details?: unknown;
};

type GuardrailRule = {
  requireActor?: boolean;
  requireTenant?: boolean;
  requiredTopLevelFields?: Array<keyof SecurityEventGuardrailInput>;
  requiredDetailPaths?: string[];
  requiredDetailAnyOfPaths?: string[][];
};

export type SecurityEventGuardrailValidationResult = {
  valid: boolean;
  errors: string[];
  isCriticalEvent: boolean;
};

export const CRITICAL_EVENT_GUARDRAILS: Record<string, GuardrailRule> = {
  [SECURITY_EVENT_TYPES.USER_CREATED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["createdUserId"],
  },
  [SECURITY_EVENT_TYPES.USER_UPDATED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["updatedFields"],
  },
  [SECURITY_EVENT_TYPES.USER_DELETED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["deletedUserId"],
  },
  [SECURITY_EVENT_TYPES.USER_REPORTS_TO_CHANGED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["userId", "previousReportsToUserId", "newReportsToUserId"],
  },
  [SECURITY_EVENT_TYPES.RBAC_ROLE_CREATED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["roleAlias"],
  },
  [SECURITY_EVENT_TYPES.RBAC_ROLE_UPDATED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["roleId", "updatedFields"],
  },
  [SECURITY_EVENT_TYPES.RBAC_ROLE_DELETED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["roleId", "roleAlias"],
  },
  [SECURITY_EVENT_TYPES.RBAC_ROLE_TEMPLATE_INITIALIZED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource"],
    requiredDetailPaths: ["templateSetName", "createdRoleCount"],
  },
  [SECURITY_EVENT_TYPES.RBAC_ROLE_ASSIGNED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["targetUserId", "tenantRoleId"],
  },
  [SECURITY_EVENT_TYPES.RBAC_ROLE_UNASSIGNED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["targetUserId", "tenantRoleId"],
  },
  [SECURITY_EVENT_TYPES.POINTS_AWARDED]: {
    requireActor: true,
    requireTenant: false,
    requiredTopLevelFields: ["resource"],
    requiredDetailAnyOfPaths: [["points"], ["awardedAmount"]],
  },
  [SECURITY_EVENT_TYPES.POINTS_SPENT]: {
    requireActor: true,
    requireTenant: false,
    requiredTopLevelFields: ["resource"],
    requiredDetailPaths: ["amount", "reason"],
  },
  [SECURITY_EVENT_TYPES.REWARD_CREATED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["rewardId"],
  },
  [SECURITY_EVENT_TYPES.REWARD_UPDATED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["rewardId", "changes"],
  },
  [SECURITY_EVENT_TYPES.REWARD_DELETED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["rewardId"],
  },
  [SECURITY_EVENT_TYPES.REWARD_REDEEMED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["rewardId", "pointsSpent"],
  },
  [SECURITY_EVENT_TYPES.SETTINGS_UPDATED]: {
    requireActor: true,
    requireTenant: true,
    requiredTopLevelFields: ["resource", "resourceId"],
    requiredDetailPaths: ["key"],
  },
  [SECURITY_EVENT_TYPES.WEBHOOK_VERIFICATION_FAILED]: {
    requireActor: false,
    requireTenant: false,
    requiredTopLevelFields: ["resource"],
  },
};

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function getNestedValue(input: unknown, path: string): unknown {
  if (!input || typeof input !== "object") return undefined;
  const segments = path.split(".");
  let current: unknown = input;
  for (const segment of segments) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

export function isCriticalSecurityEventType(eventType: string): boolean {
  return Object.prototype.hasOwnProperty.call(CRITICAL_EVENT_GUARDRAILS, eventType);
}

export function validateSecurityEventGuardrails(
  event: SecurityEventGuardrailInput
): SecurityEventGuardrailValidationResult {
  const rule = CRITICAL_EVENT_GUARDRAILS[event.eventType];
  if (!rule) {
    return { valid: true, errors: [], isCriticalEvent: false };
  }

  const errors: string[] = [];

  if (rule.requireActor && !isPresent(event.actorUserId) && !isPresent(event.actorClerkId)) {
    errors.push("actorUserId or actorClerkId is required");
  }

  if (rule.requireTenant && !isPresent(event.tenantId)) {
    errors.push("tenantId is required");
  }

  if (rule.requiredTopLevelFields?.length) {
    for (const field of rule.requiredTopLevelFields) {
      if (!isPresent(event[field])) {
        errors.push(`${String(field)} is required`);
      }
    }
  }

  if (rule.requiredDetailPaths?.length) {
    for (const detailPath of rule.requiredDetailPaths) {
      if (!isPresent(getNestedValue(event.details, detailPath))) {
        errors.push(`details.${detailPath} is required`);
      }
    }
  }

  if (rule.requiredDetailAnyOfPaths?.length) {
    for (const pathGroup of rule.requiredDetailAnyOfPaths) {
      const hasAny = pathGroup.some((path) => isPresent(getNestedValue(event.details, path)));
      if (!hasAny) {
        errors.push(`one of [${pathGroup.map((path) => `details.${path}`).join(", ")}] is required`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    isCriticalEvent: true,
  };
}

export function assertSecurityEventGuardrails(event: SecurityEventGuardrailInput): void {
  const result = validateSecurityEventGuardrails(event);
  if (!result.valid) {
    throw new Error(`Security event guardrail validation failed: ${result.errors.join("; ")}`);
  }
}
