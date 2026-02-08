import { NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { clerkClient } from "@clerk/nextjs/server";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth.js";

// Get all users for a tenant
export async function GET(request, { params }) {
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
 * Body: { username, firstName, lastName, password, email?, tenantRoleId? }
 */
export async function POST(request, { params }) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId } = await params;
    const body = await request.json();
    const {
      username,
      firstName,
      lastName,
      password,
      email,
      tenantRoleId,
    } = body;

    if (!username?.trim() || !firstName?.trim() || !lastName?.trim() || !password) {
      return NextResponse.json(
        { error: "Username, first name, last name, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (!tenantRoleId || !String(tenantRoleId).trim()) {
      return NextResponse.json(
        { error: "A role is required. Please select a role for the user." },
        { status: 400 }
      );
    }

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
      where: { username: username.trim() },
    });
    if (existingDb) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;
    const existingClerk = await client.users.getUserList({
      username: [username.trim()],
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

    const createParams = {
      username: username.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password,
    };
    if (email?.trim()) {
      createParams.emailAddress = [email.trim()];
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
    console.error("Error creating tenant user:", error);
    const message = error.message || "Failed to create user. Please try again.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
