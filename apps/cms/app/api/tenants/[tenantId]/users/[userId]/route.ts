import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@skill-learn/database";
import { clerkClient } from "@clerk/nextjs/server";
import { requireSuperAdmin } from "@skill-learn/lib/utils/auth";
import { syncUserMetadataToClerk } from "@skill-learn/lib/utils/clerkSync";
import type { RouteContext } from "@/types";

type TenantUserParams = { tenantId: string; userId: string };

/**
 * PUT /api/tenants/[tenantId]/users/[userId]
 * Update a tenant user. [userId] is the Clerk user ID (clerkId).
 * Body: { firstName?, lastName?, username?, tenantRoleId? }
 * Profile changes go to Clerk (webhook syncs to DB). Role changes are applied in DB and Clerk metadata is synced.
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext<TenantUserParams>
) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId, userId: clerkId } = await params;
    const body = await request.json();
    const { firstName, lastName, username, tenantRoleId } = body;

    if (!tenantRoleId || !String(tenantRoleId).trim()) {
      return NextResponse.json(
        { error: "A role is required. Please select a role for the user." },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const dbUser = await prisma.user.findFirst({
      where: { clerkId, tenantId },
      select: { id: true },
    });
    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in this tenant." },
        { status: 404 }
      );
    }

    const role = await prisma.tenantRole.findFirst({
      where: { id: tenantRoleId, tenantId, isActive: true },
      select: { id: true },
    });
    if (!role) {
      return NextResponse.json(
        { error: "Selected role is not found or is inactive. Please choose an active role for this tenant." },
        { status: 400 }
      );
    }

    const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;

    const updateData = {};
    if (firstName !== undefined) {
      const v = String(firstName).trim();
      if (!v) {
        return NextResponse.json({ error: "First name cannot be empty." }, { status: 400 });
      }
      updateData.firstName = v;
    }
    if (lastName !== undefined) {
      const v = String(lastName).trim();
      if (!v) {
        return NextResponse.json({ error: "Last name cannot be empty." }, { status: 400 });
      }
      updateData.lastName = v;
    }
    if (username !== undefined) {
      const trimmed = String(username).trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Username cannot be empty." }, { status: 400 });
      }
      const existing = await prisma.user.findFirst({
        where: { username: trimmed, NOT: { clerkId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Username is already taken by another user." }, { status: 400 });
      }
      updateData.username = trimmed;
    }

    if (Object.keys(updateData).length > 0) {
      await client.users.updateUser(clerkId, updateData);
    }

    const existingAssignment = await prisma.userRole.findFirst({
      where: { userId: clerkId, tenantId },
      select: { id: true, tenantRoleId: true },
    });
    if (existingAssignment) {
      if (existingAssignment.tenantRoleId !== role.id) {
        await prisma.userRole.update({
          where: { id: existingAssignment.id },
          data: { tenantRoleId: role.id },
        });
        await syncUserMetadataToClerk(clerkId, tenantId);
      }
    } else {
      await prisma.userRole.create({
        data: {
          userId: clerkId,
          tenantId,
          tenantRoleId: role.id,
          assignedBy: "cms_super_admin",
        },
      });
      await syncUserMetadataToClerk(clerkId, tenantId);
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error) {
    console.error("Error updating tenant user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tenants/[tenantId]/users/[userId]
 * Delete a tenant user. [userId] is the Clerk user ID. Deleting in Clerk triggers user.deleted webhook which removes User and UserRoles from DB.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext<TenantUserParams>
) {
  try {
    const adminResult = await requireSuperAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult;
    }

    const { tenantId, userId: clerkId } = await params;

    const dbUser = await prisma.user.findFirst({
      where: { clerkId, tenantId },
      select: { id: true },
    });
    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in this tenant" },
        { status: 404 }
      );
    }

    const client = typeof clerkClient === "function" ? await clerkClient() : clerkClient;
    await client.users.deleteUser(clerkId);

    return NextResponse.json({
      success: true,
      message: "User deleted. Database will be updated by webhook.",
    });
  } catch (error) {
    console.error("Error deleting tenant user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
