import assert from "node:assert/strict";
import test from "node:test";
import { SECURITY_EVENT_TYPES } from "../../packages/lib/utils/security/eventTypes";
import {
  CRITICAL_EVENT_GUARDRAILS,
  isCriticalSecurityEventType,
  validateSecurityEventGuardrails,
} from "../../packages/lib/utils/security/guardrails";

test("critical guardrail map includes phase 1 LMS event types", () => {
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
    assert.ok(
      Object.prototype.hasOwnProperty.call(CRITICAL_EVENT_GUARDRAILS, eventType),
      `Missing critical guardrail for ${eventType}`
    );
    assert.equal(isCriticalSecurityEventType(eventType), true);
  }
});

test("user.created fails guardrail validation when required details are missing", () => {
  const result = validateSecurityEventGuardrails({
    eventType: SECURITY_EVENT_TYPES.USER_CREATED,
    actorUserId: "507f1f77bcf86cd799439011",
    tenantId: "507f1f77bcf86cd799439012",
    resource: "user",
    resourceId: "507f1f77bcf86cd799439013",
    details: {},
  });

  assert.equal(result.isCriticalEvent, true);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("details.createdUserId")));
});

test("reward.redeemed passes guardrails when required context is present", () => {
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

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("points.awarded accepts either points or awardedAmount detail fields", () => {
  const withPoints = validateSecurityEventGuardrails({
    eventType: SECURITY_EVENT_TYPES.POINTS_AWARDED,
    actorUserId: "507f1f77bcf86cd799439011",
    resource: "points",
    details: {
      points: 10,
    },
  });
  assert.equal(withPoints.valid, true);

  const withAwardedAmount = validateSecurityEventGuardrails({
    eventType: SECURITY_EVENT_TYPES.POINTS_AWARDED,
    actorUserId: "507f1f77bcf86cd799439011",
    resource: "points",
    details: {
      awardedAmount: 10,
    },
  });
  assert.equal(withAwardedAmount.valid, true);
});

test("non-critical event type bypasses critical guardrails", () => {
  const result = validateSecurityEventGuardrails({
    eventType: "audit.legacy.reward.update",
    details: {},
  });

  assert.equal(result.isCriticalEvent, false);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});
