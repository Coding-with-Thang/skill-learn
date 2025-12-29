import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { logAuditEvent } from "@/utils/auditLogger";
import { requireAdmin, requireAuth } from "@/utils/auth";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";

export async function GET(request) {
  try {
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const resource = searchParams.get("resource");
    const action = searchParams.get("action");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where = {};
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

    return NextResponse.json({
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
export async function POST(request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const userId = authResult;

    // Get the actual user ID from the database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("User not found", ErrorType.NOT_FOUND, {
        status: 404,
      });
    }

    const { action, resource, resourceId, details } = await request.json();

    await logAuditEvent(user.id, action, resource, resourceId, details);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
