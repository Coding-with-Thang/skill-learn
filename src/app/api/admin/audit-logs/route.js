import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { logAuditEvent } from "@/utils/auditLogger";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Verify OPERATIONS role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "OPERATIONS") {
      return new Response("Unauthorized - Requires OPERATIONS role", {
        status: 403,
      });
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
    console.error("Error fetching audit logs:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get the actual user ID from the database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const { action, resource, resourceId, details } = await request.json();

    await logAuditEvent(user.id, action, resource, resourceId, details);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging audit event:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
