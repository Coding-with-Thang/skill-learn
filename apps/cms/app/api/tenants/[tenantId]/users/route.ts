import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { clerkClient } from "@clerk/nextjs/server";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";
import { validateRequestBody } from "@skill-learn/lib/utils/validateRequest";
import { handleApiError } from "@skill-learn/lib/utils/errorHandler";
import { tenantUserCreateSchema } from "@skill-learn/lib/zodSchemas";

import type { RouteContext } from "@/types";

type TenantIdParams = { tenantId: string };

// Get all users for a tenant
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<TenantIdParams>
) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // Get all users for this tenant
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        clerkId: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        role: true,
        points: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching tenant users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants/[tenantId]/users
 * Create a tenant user via Clerk. Webhook (user.created) will create User in DB and assign role.
 * Body: { username, firstName, lastName, password, email?, tenantRoleId } — validated with tenantUserCreateSchema.
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext<TenantIdParams>
) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;

    let data;
    try {
      data = await validateRequestBody(request, tenantUserCreateSchema);
    } catch (err) {
      if (err instanceof SyntaxError || (err instanceof Error && err.message.toLowerCase().includes("json"))) {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
      }
      throw err;
    }

    const { username, firstName, lastName, password, email, tenantRoleId } = data;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        defaultRole: { select: { id: true, roleAlias: true } },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const role = await prisma.tenantRole.findFirst({
      where: { id: tenantRoleId, tenantId, isActive: true },
      select: { roleAlias: true },
    });
    if (!role) {
      return NextResponse.json(
        { error: "Selected role is not found or is inactive. Please choose an active role for this tenant." },
        { status: 400 }
      );
    }
    const roleAlias = role.roleAlias;

    const existingDb = await prisma.user.findUnique({
      where: { username },
    });
    if (existingDb) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;
    const existingClerk = await client.users.getUserList({
      username: [username],
      limit: 1,
    });
    const clerkList = Array.isArray(existingClerk) ? existingClerk : existingClerk?.data || [];
    if (clerkList.length > 0) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const publicMetadata = {
      tenantId,
      tenantSlug: tenant.slug,
      defaultRole: roleAlias,
    };

    const createParams: {
      username: string;
      firstName: string;
      lastName: string;
      password: string;
      emailAddress?: string[];
    } = {
      username,
      firstName,
      lastName,
      password,
    };
    if (email) {
      createParams.emailAddress = [email];
    }

    const clerkUser = await client.users.createUser(createParams);

    await client.users.updateUserMetadata(clerkUser.id, {
      publicMetadata,
    });

    return NextResponse.json({
      success: true,
      message: "User created. They will appear in the list after the system syncs.",
      user: {
        clerkId: clerkUser.id,
        username: clerkUser.username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      },
    });
  } catch (error) {
    return handleApiError(error, null, 500);
  }
}
