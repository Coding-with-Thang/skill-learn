import { NextRequest } from "next/server";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SECURITY_EVENT_CATEGORIES,
  SECURITY_EVENT_TYPES,
} from "../../../../packages/lib/utils/security/eventTypes";

const mocks = vi.hoisted(() => ({
  headerGet: vi.fn(),
  logSecurityEvent: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve({
      get: (name: string) => mocks.headerGet(name),
    }),
}));

vi.mock("@skill-learn/lib/utils/security/logger", () => ({
  logSecurityEvent: mocks.logSecurityEvent,
}));

vi.mock("@skill-learn/database", () => ({
  prisma: {},
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(),
}));

describe("Clerk webhooks route integration", () => {
  let POST: typeof import("../../../../apps/lms/app/api/webhooks/route").POST;
  const originalWebhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  const originalWebhookSecretAlt = process.env.WEBHOOK_SECRET;

  beforeAll(async () => {
    // Svix secrets must be whsec_<base64>; invalid encoding makes Webhook ctor throw (500).
    process.env.CLERK_WEBHOOK_SECRET = `whsec_${Buffer.from("integration-test-secret-32bytes!").toString("base64")}`;
    delete process.env.WEBHOOK_SECRET;
    const mod = await import("../../../../apps/lms/app/api/webhooks/route");
    POST = mod.POST;
  });

  afterAll(() => {
    if (originalWebhookSecret !== undefined) {
      process.env.CLERK_WEBHOOK_SECRET = originalWebhookSecret;
    } else {
      delete process.env.CLERK_WEBHOOK_SECRET;
    }
    if (originalWebhookSecretAlt !== undefined) {
      process.env.WEBHOOK_SECRET = originalWebhookSecretAlt;
    } else {
      delete process.env.WEBHOOK_SECRET;
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.logSecurityEvent.mockResolvedValue(undefined);
  });

  it("returns 400 and logs verification failure when Svix headers are missing", async () => {
    mocks.headerGet.mockReturnValue(null);

    const req = new NextRequest("http://localhost/api/webhooks", {
      method: "POST",
      body: "{}",
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    expect(mocks.logSecurityEvent).toHaveBeenCalledTimes(1);
    expect(mocks.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: SECURITY_EVENT_TYPES.WEBHOOK_VERIFICATION_FAILED,
        category: SECURITY_EVENT_CATEGORIES.WEBHOOK,
        outcome: "failure",
      })
    );
  });

  it("returns 400 and logs verification failure when signature is invalid", async () => {
    mocks.headerGet.mockImplementation((name: string) => {
      const n = name.toLowerCase();
      if (n === "svix-id") return "msg_svix_test";
      if (n === "svix-timestamp") return String(Math.floor(Date.now() / 1000));
      if (n === "svix-signature") return "v1,deadbeef";
      return null;
    });

    const req = new NextRequest("http://localhost/api/webhooks", {
      method: "POST",
      body: JSON.stringify({ type: "user.created", data: {} }),
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
    expect(mocks.logSecurityEvent).toHaveBeenCalledTimes(1);
    expect(mocks.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: SECURITY_EVENT_TYPES.WEBHOOK_VERIFICATION_FAILED,
      })
    );
  });

  it("returns 500 and logs processing failure when webhook secret is not configured", async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;
    delete process.env.WEBHOOK_SECRET;

    mocks.headerGet.mockReturnValue(null);

    const req = new NextRequest("http://localhost/api/webhooks", {
      method: "POST",
      body: "{}",
    });

    const response = await POST(req);

    expect(response.status).toBe(500);
    expect(mocks.logSecurityEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: SECURITY_EVENT_TYPES.WEBHOOK_PROCESSING_FAILED,
        category: SECURITY_EVENT_CATEGORIES.WEBHOOK,
      })
    );

    process.env.CLERK_WEBHOOK_SECRET = `whsec_${Buffer.from("integration-test-secret-32bytes!").toString("base64")}`;
  });
});
