import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SECURITY_EVENT_CATEGORIES, SECURITY_EVENT_TYPES } from "../../../../packages/lib/utils/security/eventTypes";

const mocks = vi.hoisted(() => {
  const requireTenantContext = vi.fn();
  const requirePermission = vi.fn();
  const requireAnyPermission = vi.fn();
  const syncUserMetadataToClerk = vi.fn();
  const logSecurityEvent = vi.fn();

  return {
    requireTenantContext,
    requirePermission,
    requireAnyPermission,
    syncUserMetadataToClerk,
    logSecurityEvent,
    prisma: {
      tenantRole: {
        findFirst: vi.fn(),
      },
      user: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      userRole: {
        findFirst: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock("@skill-learn/lib/utils/tenant", () => ({
  requireTenantContext: mocks.requireTenantContext,
}));

vi.mock("@skill-learn/lib/utils/permissions", () => ({
  requirePermission: mocks.requirePermission,
  requireAnyPermission: mocks.requireAnyPermission,
  PERMISSIONS: {
    ROLES_READ: "roles.read",
    ROLES_ASSIGN: "roles.assign",
  },
}));

vi.mock("@skill-learn/lib/utils/clerkSync", () => ({
  syncUserMetadataToClerk: mocks.syncUserMetadataToClerk,
}));

vi.mock("@skill-learn/lib/utils/security/logger", () => ({
  logSecurityEvent: mocks.logSecurityEvent,
}));

vi.mock("@skill-learn/database", () => ({
  prisma: mocks.prisma,
}));

describe("tenant user-roles route integration", () => {
  let routeModule: typeof import("../../../../apps/lms/app/api/tenant/user-roles/route");

  beforeAll(async () => {
    routeModule = await import("../../../../apps/lms/app/api/tenant/user-roles/route");
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireTenantContext.mockResolvedValue({
      tenantId: "tenant_1",
      userId: "clerk_admin_1",
    });
    mocks.requirePermission.mockResolvedValue({ ok: true });
    mocks.requireAnyPermission.mockResolvedValue({ ok: true });
    mocks.syncUserMetadataToClerk.mockResolvedValue(undefined);
    mocks.logSecurityEvent.mockResolvedValue(undefined);
  });

  it("POST assigns role and emits RBAC_ROLE_ASSIGNED payload", async () => {
    mocks.prisma.tenantRole.findFirst.mockResolvedValue({
      id: "507f1f77bcf86cd799439031",
      roleAlias: "Manager",
      isActive: true,
    });
    mocks.prisma.user.findFirst.mockResolvedValue({
      id: "507f1f77bcf86cd799439032",
      clerkId: "clerk_user_1",
      tenantId: "tenant_1",
    });
    mocks.prisma.userRole.findFirst.mockResolvedValue(null);
    mocks.prisma.userRole.create.mockResolvedValue({
      id: "507f1f77bcf86cd799439033",
      userId: "clerk_user_1",
      tenantRoleId: "507f1f77bcf86cd799439031",
      assignedAt: new Date("2026-01-01T00:00:00.000Z"),
      tenantRole: {
        id: "507f1f77bcf86cd799439031",
        roleAlias: "Manager",
        description: "Ops manager",
      },
    });

    const request = new Request("http://localhost/api/tenant/user-roles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: "clerk_user_1",
        tenantRoleId: "507f1f77bcf86cd799439031",
      }),
    });

    const response = await routeModule.POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toMatchObject({
      userRole: {
        id: "507f1f77bcf86cd799439033",
      },
    });

    expect(mocks.logSecurityEvent).toHaveBeenCalledTimes(1);
    expect(mocks.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorClerkId: "clerk_admin_1",
        tenantId: "tenant_1",
        eventType: SECURITY_EVENT_TYPES.RBAC_ROLE_ASSIGNED,
        category: SECURITY_EVENT_CATEGORIES.RBAC,
        action: "assign",
        resource: "user_role",
        resourceId: "507f1f77bcf86cd799439033",
      })
    );

    const emitted = mocks.logSecurityEvent.mock.calls[0][0];
    expect(emitted.details).toMatchObject({
      targetUserId: "clerk_user_1",
      tenantRoleId: "507f1f77bcf86cd799439031",
      roleAlias: "Manager",
    });
  });

  it("DELETE removes assignment and emits RBAC_ROLE_UNASSIGNED payload", async () => {
    mocks.prisma.userRole.findFirst.mockResolvedValue({
      id: "507f1f77bcf86cd799439033",
      userId: "clerk_user_1",
      tenantRoleId: "507f1f77bcf86cd799439031",
      tenantId: "tenant_1",
    });
    mocks.prisma.userRole.delete.mockResolvedValue({
      id: "507f1f77bcf86cd799439033",
    });

    const request = new Request(
      "http://localhost/api/tenant/user-roles?userRoleId=507f1f77bcf86cd799439033",
      {
        method: "DELETE",
      }
    );

    const response = await routeModule.DELETE(request as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      success: true,
      message: "Role assignment removed",
    });

    expect(mocks.logSecurityEvent).toHaveBeenCalledTimes(1);
    expect(mocks.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        actorClerkId: "clerk_admin_1",
        tenantId: "tenant_1",
        eventType: SECURITY_EVENT_TYPES.RBAC_ROLE_UNASSIGNED,
        category: SECURITY_EVENT_CATEGORIES.RBAC,
        action: "unassign",
        resource: "user_role",
        resourceId: "507f1f77bcf86cd799439033",
      })
    );

    const emitted = mocks.logSecurityEvent.mock.calls[0][0];
    expect(emitted.details).toMatchObject({
      targetUserId: "clerk_user_1",
      tenantRoleId: "507f1f77bcf86cd799439031",
    });
  });
});
