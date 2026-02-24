import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { logSecurityEvent } from "@skill-learn/lib/utils/security/logger";
import { SECURITY_EVENT_CATEGORIES, SECURITY_EVENT_TYPES } from "@skill-learn/lib/utils/security/eventTypes";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

function stringifyDetails(details: unknown): string | undefined {
  if (details === undefined || details === null) return undefined;
  if (typeof details === "string") return details;
  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}

export async function GET(_request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = adminResult;
    if (!tenantId) {
      return successResponse({ logs: [], total: 0 });
    }

    // Get query parameters
    const { searchParams } = new URL(_request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const resource = searchParams.get("resource");
    const action = searchParams.get("action");
    const eventType = searchParams.get("eventType");
    const severity = searchParams.get("severity");
    const outcome = searchParams.get("outcome");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause - tenant scoped for LMS phase 1
    const where: {
      tenantId: string;
      resource?: string;
      action?: string;
      eventType?: string;
      severity?: string;
      outcome?: string;
      occurredAt?: { gte?: Date; lte?: Date };
    } = { tenantId };

    if (resource) where.resource = resource;
    if (action) where.action = action;
    if (eventType) where.eventType = eventType;
    if (severity) where.severity = severity;
    if (outcome) where.outcome = outcome;
    if (startDate || endDate) {
      where.occurredAt = {};
      if (startDate) where.occurredAt.gte = new Date(startDate);
      if (endDate) where.occurredAt.lte = new Date(endDate);
    }

    // Get total count for pagination
    const total = await prisma.securityAuditEvent.count({ where });

    // Get security audit logs
    const events = await prisma.securityAuditEvent.findMany({
      where,
      orderBy: {
        occurredAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const actorIds = events
      .map((event) => event.actorUserId)
      .filter((id): id is string => typeof id === "string");
    const uniqueActorIds = [...new Set(actorIds)];

    const users = uniqueActorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: uniqueActorIds } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        })
      : [];

    const userMap = new Map(users.map((user) => [user.id, user]));

    const logs = events.map((event) => {
      const actorUser = event.actorUserId ? userMap.get(event.actorUserId) : undefined;
      const details =
        event.message ||
        stringifyDetails(event.details) ||
        `${event.eventType} (${event.outcome})`;

      return {
        id: event.id,
        eventId: event.eventId,
        timestamp: event.occurredAt,
        action: event.action,
        resource: event.resource || event.category,
        eventType: event.eventType,
        severity: event.severity,
        outcome: event.outcome,
        riskScore: event.riskScore,
        details,
        user: actorUser
          ? {
              id: actorUser.id,
              firstName: actorUser.firstName,
              lastName: actorUser.lastName,
            }
          : {
              id: event.actorClerkId || "system",
              firstName: event.actorDisplayName || (event.actorType === "system" ? "System" : "Unknown"),
              lastName: "",
            },
      };
    });

    return successResponse({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
export async function POST(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }
    const { user } = adminResult;

    const payload = await request.json();
    const {
      action,
      resource,
      resourceId,
      details,
      eventType,
      category,
      severity,
      outcome,
      riskScore,
      reasonCodes,
    } = payload;

    await logSecurityEvent({
      actorUserId: user.id,
      actorClerkId: adminResult.userId,
      tenantId: adminResult.tenantId || undefined,
      eventType: eventType || SECURITY_EVENT_TYPES.AUDIT_MANUAL,
      category: category || SECURITY_EVENT_CATEGORIES.AUDIT,
      action: action || "create",
      resource: resource || "audit",
      resourceId: resourceId || undefined,
      message: typeof details === "string" ? details : "Manual admin audit event",
      details,
      severity: severity || "low",
      outcome: outcome || "success",
      riskScore,
      reasonCodes: Array.isArray(reasonCodes) ? reasonCodes : [],
      request,
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
