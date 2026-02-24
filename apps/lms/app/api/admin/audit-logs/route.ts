import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@skill-learn/database';
import { logAuditEvent } from "@skill-learn/lib/utils/auditLogger";
import { requireAdmin } from "@skill-learn/lib/utils/auth";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper";

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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause - only logs for users in this tenant
    const where: { user: { tenantId: string }; resource?: string; action?: string; timestamp?: { gte?: Date; lte?: Date } } = { user: { tenantId } };
    if (resource) where.resource = resource;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    // Get total count for pagination
    const total = await prisma.auditLog.count({ where });

    // Get audit logs
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
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

    const { action, resource, resourceId, details } = await request.json();

    await logAuditEvent(user.id, action, resource, resourceId, details);

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
