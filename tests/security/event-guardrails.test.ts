import { describe, expect, it } from "vitest";
import { SECURITY_EVENT_TYPES } from "../../packages/lib/utils/security/eventTypes";
import {
  CRITICAL_EVENT_GUARDRAILS,
  isCriticalSecurityEventType,
  validateSecurityEventGuardrails,
} from "../../packages/lib/utils/security/guardrails";

describe("security event guardrails", () => {
  it("critical guardrail map includes phase 1 LMS event types", () => {
    const requiredCriticalEvents = [
      SECURITY_EVENT_TYPES.USER_CREATED,
      SECURITY_EVENT_TYPES.USER_UPDATED,
      SECURITY_EVENT_TYPES.USER_DELETED,
      SECURITY_EVENT_TYPES.RBAC_ROLE_CREATED,
      SECURITY_EVENT_TYPES.RBAC_ROLE_UPDATED,
      SECURITY_EVENT_TYPES.RBAC_ROLE_DELETED,
      SECURITY_EVENT_TYPES.RBAC_ROLE_ASSIGNED,
      SECURITY_EVENT_TYPES.RBAC_ROLE_UNASSIGNED,
      SECURITY_EVENT_TYPES.REWARD_REDEEMED,
      SECURITY_EVENT_TYPES.SETTINGS_UPDATED,
      SECURITY_EVENT_TYPES.WEBHOOK_VERIFICATION_FAILED,
    ];

    for (const eventType of requiredCriticalEvents) {
      expect(Object.prototype.hasOwnProperty.call(CRITICAL_EVENT_GUARDRAILS, eventType)).toBe(
        true,
      );
      expect(isCriticalSecurityEventType(eventType)).toBe(true);
    }
  });

  it("user.created fails guardrail validation when required details are missing", () => {
    const result = validateSecurityEventGuardrails({
      eventType: SECURITY_EVENT_TYPES.USER_CREATED,
      actorUserId: "507f1f77bcf86cd799439011",
      tenantId: "507f1f77bcf86cd799439012",
      resource: "user",
      resourceId: "507f1f77bcf86cd799439013",
      details: {},
    });

    expect(result.isCriticalEvent).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("details.createdUserId"))).toBe(true);
  });

  it("reward.redeemed passes guardrails when required context is present", () => {
    const result = validateSecurityEventGuardrails({
      eventType: SECURITY_EVENT_TYPES.REWARD_REDEEMED,
      actorUserId: "507f1f77bcf86cd799439011",
      tenantId: "507f1f77bcf86cd799439012",
      resource: "reward",
      resourceId: "507f1f77bcf86cd799439013",
      details: {
        rewardId: "507f1f77bcf86cd799439013",
        pointsSpent: 150,
      },
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("points.awarded accepts either points or awardedAmount detail fields", () => {
    const withPoints = validateSecurityEventGuardrails({
      eventType: SECURITY_EVENT_TYPES.POINTS_AWARDED,
      actorUserId: "507f1f77bcf86cd799439011",
      resource: "points",
      details: {
        points: 10,
      },
    });
    expect(withPoints.valid).toBe(true);

    const withAwardedAmount = validateSecurityEventGuardrails({
      eventType: SECURITY_EVENT_TYPES.POINTS_AWARDED,
      actorUserId: "507f1f77bcf86cd799439011",
      resource: "points",
      details: {
        awardedAmount: 10,
      },
    });
    expect(withAwardedAmount.valid).toBe(true);
  });

  it("non-critical event type bypasses critical guardrails", () => {
    const result = validateSecurityEventGuardrails({
      eventType: "audit.legacy.reward.update",
      details: {},
    });

    expect(result.isCriticalEvent).toBe(false);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
