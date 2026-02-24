import { createHmac, randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@skill-learn/database";
import { redactSensitiveData } from "./redaction";
import {
  securityAuditEventInputSchema,
  type SecurityAuditEventInput,
  type SecurityRequestContext,
} from "./schema";

const OBJECT_ID_PATTERN = /^[a-fA-F0-9]{24}$/;
const AUDIT_HASH_SECRET = process.env.AUDIT_LOG_HASH_SECRET || "skill-learn-audit-dev-secret";

type LogSecurityEventInput = SecurityAuditEventInput & {
  request?: NextRequest | null | undefined;
};

function isObjectId(value: unknown): value is string {
  return typeof value === "string" && OBJECT_ID_PATTERN.test(value);
}

function getClientIpAddress(request: NextRequest): string | undefined {
  const rawForwarded =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip");

  if (!rawForwarded) return undefined;
  const firstHop = rawForwarded.split(",")[0]?.trim();
  return firstHop || undefined;
}

export function buildRequestContextFromRequest(
  request?: NextRequest | null
): SecurityRequestContext | undefined {
  if (!request) return undefined;

  let route: string | undefined;
  try {
    route = new URL(request.url).pathname;
  } catch {
    route = undefined;
  }

  return {
    ipAddress: getClientIpAddress(request),
    userAgent: request.headers.get("user-agent") || undefined,
    requestId:
      request.headers.get("x-request-id") ||
      request.headers.get("x-correlation-id") ||
      undefined,
    route,
    httpMethod: request.method || undefined,
    correlationId:
      request.headers.get("x-correlation-id") ||
      request.headers.get("x-trace-id") ||
      undefined,
    sessionId: request.headers.get("x-session-id") || undefined,
  };
}

function toJsonSafe(value: unknown): unknown {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(
      JSON.stringify(value, (_key, nestedValue: unknown) => {
        if (nestedValue instanceof Date) {
          return nestedValue.toISOString();
        }
        if (nestedValue instanceof Error) {
          return {
            name: nestedValue.name,
            message: nestedValue.message,
            stack: nestedValue.stack,
          };
        }
        return nestedValue;
      })
    );
  } catch {
    return { value: String(value) };
  }
}

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return JSON.stringify(value);
  }
  if (typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const serialized = entries
    .map(([key, nestedValue]) => `${JSON.stringify(key)}:${stableStringify(nestedValue)}`)
    .join(",");
  return `{${serialized}}`;
}

type ResolvedActor = {
  actorUserId?: string | undefined;
  actorClerkId?: string | undefined;
  tenantId?: string | undefined;
  actorDisplayName?: string | undefined;
};

async function resolveActor(
  actorUserId?: string,
  actorClerkId?: string
): Promise<ResolvedActor> {
  try {
    if (isObjectId(actorUserId)) {
      const user = await prisma.user.findUnique({
        where: { id: actorUserId },
        select: {
          id: true,
          clerkId: true,
          tenantId: true,
          firstName: true,
          lastName: true,
        },
      });

      if (user) {
        return {
          actorUserId: user.id,
          actorClerkId: user.clerkId,
          tenantId: user.tenantId || undefined,
          actorDisplayName: `${user.firstName} ${user.lastName}`.trim() || undefined,
        };
      }
    }

    const clerkIdCandidate = actorClerkId || actorUserId;
    if (typeof clerkIdCandidate === "string" && clerkIdCandidate.length > 0) {
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkIdCandidate },
        select: {
          id: true,
          clerkId: true,
          tenantId: true,
          firstName: true,
          lastName: true,
        },
      });

      if (user) {
        return {
          actorUserId: user.id,
          actorClerkId: user.clerkId,
          tenantId: user.tenantId || undefined,
          actorDisplayName: `${user.firstName} ${user.lastName}`.trim() || undefined,
        };
      }
    }
  } catch (error) {
    console.error("Failed to resolve actor for security event:", error);
  }

  if (actorClerkId) {
    return { actorClerkId };
  }

  if (isObjectId(actorUserId)) {
    return { actorUserId };
  }

  return {};
}

async function getPreviousRecordHash(tenantId?: string): Promise<string | undefined> {
  try {
    const latestEvent = await prisma.securityAuditEvent.findFirst({
      where: tenantId ? { tenantId } : undefined,
      select: { recordHash: true },
      orderBy: [{ ingestedAt: "desc" }, { occurredAt: "desc" }],
    });

    return latestEvent?.recordHash || undefined;
  } catch (error) {
    console.error("Failed to load previous security event hash:", error);
    return undefined;
  }
}

function computeRecordHash(payload: unknown): string {
  return createHmac("sha256", AUDIT_HASH_SECRET).update(stableStringify(payload)).digest("hex");
}

export async function logSecurityEvent(input: LogSecurityEventInput): Promise<void> {
  const { request, ...rawInput } = input;
  const parsed = securityAuditEventInputSchema.safeParse(rawInput);
  const throwOnError = !!rawInput.throwOnError;

  if (!parsed.success) {
    const message = `Invalid security event payload: ${parsed.error.issues
      .map((issue) => issue.message)
      .join(", ")}`;
    if (throwOnError) {
      throw new Error(message);
    }
    console.error(message, rawInput);
    return;
  }

  try {
    const event = parsed.data;
    const requestContextFromRequest = buildRequestContextFromRequest(request);
    const requestContext = {
      ...requestContextFromRequest,
      ...(event.requestContext || {}),
    };

    const resolvedActor = await resolveActor(event.actorUserId, event.actorClerkId);
    const eventId = randomUUID();
    const tenantId =
      typeof event.tenantId === "string"
        ? event.tenantId
        : resolvedActor.tenantId || undefined;
    const occurredAt = event.occurredAt || new Date();
    const ingestedAt = new Date();
    const sanitizedDetails = toJsonSafe(redactSensitiveData(event.details));
    const prevHash = await getPreviousRecordHash(tenantId);

    const hashPayload = {
      eventId,
      schemaVersion: "securityEvent.v1",
      actorUserId: resolvedActor.actorUserId,
      actorClerkId: event.actorClerkId || resolvedActor.actorClerkId,
      actorType: event.actorType || (resolvedActor.actorUserId || resolvedActor.actorClerkId ? "user" : "system"),
      actorDisplayName: event.actorDisplayName || resolvedActor.actorDisplayName,
      tenantId,
      eventType: event.eventType,
      category: event.category,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId || undefined,
      outcome: event.outcome || "success",
      severity: event.severity || "low",
      riskScore: event.riskScore,
      reasonCodes: event.reasonCodes || [],
      message: event.message,
      details: sanitizedDetails,
      requestContext,
      retentionClass: event.retentionClass || "standard",
      occurredAt: occurredAt.toISOString(),
      ingestedAt: ingestedAt.toISOString(),
      prevHash: prevHash || null,
    };

    const recordHash = computeRecordHash(hashPayload);

    await prisma.securityAuditEvent.create({
      data: {
        eventId,
        schemaVersion: "securityEvent.v1",
        actorUserId: resolvedActor.actorUserId,
        actorClerkId: event.actorClerkId || resolvedActor.actorClerkId,
        actorType:
          event.actorType ||
          (resolvedActor.actorUserId || resolvedActor.actorClerkId ? "user" : "system"),
        actorDisplayName: event.actorDisplayName || resolvedActor.actorDisplayName,
        tenantId,
        eventType: event.eventType,
        category: event.category,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId || undefined,
        outcome: event.outcome || "success",
        severity: event.severity || "low",
        riskScore: event.riskScore,
        reasonCodes: event.reasonCodes || [],
        message: event.message,
        details: sanitizedDetails as never,
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
        requestId: requestContext.requestId,
        route: requestContext.route,
        httpMethod: requestContext.httpMethod,
        correlationId: requestContext.correlationId,
        sessionId: requestContext.sessionId,
        retentionClass: event.retentionClass || "standard",
        recordHash,
        prevHash: prevHash || undefined,
        occurredAt,
        ingestedAt,
      },
    });
  } catch (error) {
    if (throwOnError) {
      throw error;
    }
    console.error("Security audit logging failed:", error);
  }
}
