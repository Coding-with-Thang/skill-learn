import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SECURITY_EVENT_CATEGORIES, SECURITY_EVENT_TYPES } from "../../../../packages/lib/utils/security/eventTypes";

const mocks = vi.hoisted(() => {
  const requireAdmin = vi.fn();
  const logSecurityEvent = vi.fn();

  return {
    requireAdmin,
    logSecurityEvent,
    prisma: {
      securityAuditEvent: {
        count: vi.fn(),
        findMany: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock("@skill-learn/lib/utils/auth", () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@skill-learn/lib/utils/security/logger", () => ({
  logSecurityEvent: mocks.logSecurityEvent,
}));

vi.mock("@skill-learn/database", () => ({
  prisma: mocks.prisma,
}));

describe("admin audit-logs route integration", () => {
  let routeModule: typeof import("../../../../apps/lms/app/api/admin/audit-logs/route");

  beforeAll(async () => {
    routeModule = await import("../../../../apps/lms/app/api/admin/audit-logs/route");
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({
      userId: "clerk_admin_1",
      tenantId: "tenant_1",
      user: { id: "507f1f77bcf86cd799439011" },
    });
    mocks.logSecurityEvent.mockResolvedValue(undefined);
  });

  it("POST emits expected structured payload with defaults", async () => {
    const request = new Request("http://localhost/api/admin/audit-logs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "create",
        resource: "reward",
        resourceId: "507f1f77bcf86cd799439012",
        details: { rewardId: "507f1f77bcf86cd799439012", prize: "Gift card" },
      }),
    });

    const response = await routeModule.POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      data: { success: true },
    });

    expect(mocks.logSecurityEvent).toHaveBeenCalledTimes(1);
    expect(mocks.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: "507f1f77bcf86cd799439011",
        actorClerkId: "clerk_admin_1",
        tenantId: "tenant_1",
        eventType: SECURITY_EVENT_TYPES.AUDIT_MANUAL,
        category: SECURITY_EVENT_CATEGORIES.AUDIT,
        action: "create",
        resource: "reward",
        resourceId: "507f1f77bcf86cd799439012",
        outcome: "success",
      })
    );
  });

  it("POST forwards explicit event classification fields", async () => {
    const request = new Request("http://localhost/api/admin/audit-logs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "update",
        resource: "user",
        resourceId: "507f1f77bcf86cd799439099",
        details: "manual update",
        eventType: SECURITY_EVENT_TYPES.USER_UPDATED,
        category: SECURITY_EVENT_CATEGORIES.USER_MANAGEMENT,
        severity: "high",
        outcome: "blocked",
        riskScore: 92,
        reasonCodes: ["manual-review", "high-risk"],
      }),
    });

    const response = await routeModule.POST(request as never);
    expect(response.status).toBe(200);

    expect(mocks.logSecurityEvent).toHaveBeenCalledTimes(1);
    expect(mocks.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: SECURITY_EVENT_TYPES.USER_UPDATED,
        category: SECURITY_EVENT_CATEGORIES.USER_MANAGEMENT,
        severity: "high",
        outcome: "blocked",
        riskScore: 92,
        reasonCodes: ["manual-review", "high-risk"],
      })
    );
  });
});
