import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@skill-learn/database";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getTenantDefaultRoleId } from "@skill-learn/lib/utils/tenantDefaultRole.js";

/**
 * Clerk Webhook Handler
 * 
 * Handles user lifecycle events and syncs with multi-tenant structure:
 * - user.created: Create user in database, handle tenant assignment
 * - user.updated: Update user data, sync tenant info to Clerk
 * - user.deleted: Remove user and their role assignments
 * 
 * Tenant assignment can happen via:
 * 1. Clerk public metadata (tenantId, tenantSlug)
 * 2. Invitation flow (invitation includes tenantId)
 * 3. Manual assignment by admin
 */
export async function POST(req) {
  try {
    // Support both CLERK_WEBHOOK_SECRET (Vercel standard) and WEBHOOK_SECRET
    const WEBHOOK_SECRET =
      process.env.CLERK_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error(
        "[Webhook] CLERK_WEBHOOK_SECRET or WEBHOOK_SECRET is missing"
      );
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("[Webhook] Missing svix headers");
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("[Webhook] Verification failed:", err.message);
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 400 }
      );
    }

    const eventType = evt.type;
    const { id, public_metadata, private_metadata, ...attributes } = evt.data;

    console.log(`[Webhook] Processing event: ${eventType} for user: ${id}`);

    // ============================================
    // USER CREATED
    // ============================================
    if (eventType === "user.created") {
      const email = attributes.email_addresses?.[0]?.email_address || null;
      
      // Check for tenant assignment in metadata
      const tenantId = public_metadata?.tenantId || private_metadata?.tenantId;
      const tenantSlug = public_metadata?.tenantSlug || private_metadata?.tenantSlug;
      const defaultRoleAlias = public_metadata?.defaultRole || private_metadata?.defaultRole;

      // Check if user is super admin (set by existing super admin)
      const clerkRole = public_metadata?.role || public_metadata?.appRole;
      const isSuperAdmin = clerkRole === "super_admin";

      // Resolve tenant by ID or slug
      let resolvedTenantId = null;
      if (tenantId) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { id: true },
        });
        if (tenant) resolvedTenantId = tenant.id;
      } else if (tenantSlug) {
        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
          select: { id: true },
        });
        if (tenant) resolvedTenantId = tenant.id;
      }

      // Create or update user in database
      const user = await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          username: attributes.username || undefined,
          firstName: attributes.first_name || undefined,
          lastName: attributes.last_name || undefined,
          email: email || undefined,
          imageUrl: attributes.image_url || undefined,
          tenantId: resolvedTenantId || undefined,
        },
        create: {
          clerkId: id,
          username: attributes.username || id,
          firstName: attributes.first_name || "",
          lastName: attributes.last_name || "",
          email: email,
          imageUrl: attributes.image_url || null,
          tenantId: resolvedTenantId,
          points: 0,
          lifetimePoints: 0,
        },
      });

      if (resolvedTenantId) {
        if (defaultRoleAlias) {
          await assignDefaultRole(id, resolvedTenantId, defaultRoleAlias);
        } else {
          const defaultRoleId = await getTenantDefaultRoleId(resolvedTenantId);
          if (defaultRoleId) {
            await createUserRoleAssignment(id, resolvedTenantId, defaultRoleId);
            console.log(`[Webhook] Assigned tenant default role to user ${id}`);
          }
        }
        await syncTenantMetadataToClerk(id, resolvedTenantId);
      }

      console.log(
        `[Webhook] Created user: ${id}, tenant: ${resolvedTenantId || "none"}, superAdmin: ${isSuperAdmin}`
      );
    }

    // ============================================
    // USER UPDATED
    // ============================================
    if (eventType === "user.updated") {
      const email = attributes.email_addresses?.[0]?.email_address || null;

      // Check for tenant changes in metadata
      const newTenantId = public_metadata?.tenantId || private_metadata?.tenantId;
      const newTenantSlug = public_metadata?.tenantSlug || private_metadata?.tenantSlug;

      // Get existing user
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: id },
        select: { id: true, tenantId: true },
      });

      // Resolve new tenant if specified
      let resolvedTenantId = existingUser?.tenantId;
      if (newTenantId) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: newTenantId },
          select: { id: true },
        });
        if (tenant) resolvedTenantId = tenant.id;
      } else if (newTenantSlug) {
        const tenant = await prisma.tenant.findUnique({
          where: { slug: newTenantSlug },
          select: { id: true },
        });
        if (tenant) resolvedTenantId = tenant.id;
      }

      // Check if tenant changed
      const tenantChanged = existingUser?.tenantId !== resolvedTenantId;

      // Build update object
      const updateData = {};
      if (attributes.username !== undefined) updateData.username = attributes.username;
      if (attributes.first_name !== undefined) updateData.firstName = attributes.first_name;
      if (attributes.last_name !== undefined) updateData.lastName = attributes.last_name;
      if (attributes.image_url !== undefined) updateData.imageUrl = attributes.image_url;
      if (email) updateData.email = email;
      if (resolvedTenantId !== undefined) updateData.tenantId = resolvedTenantId;

      // Update or create user
      const user = await prisma.user.upsert({
        where: { clerkId: id },
        update: updateData,
        create: {
          clerkId: id,
          username: attributes.username || id,
          firstName: attributes.first_name || "",
          lastName: attributes.last_name || "",
          email: email,
          imageUrl: attributes.image_url || null,
          tenantId: resolvedTenantId,
          points: 0,
          lifetimePoints: 0,
        },
      });

      // If tenant changed, remove old role assignments
      if (tenantChanged && existingUser?.tenantId) {
        await prisma.userRole.deleteMany({
          where: {
            userId: id,
            tenantId: existingUser.tenantId,
          },
        });
        console.log(`[Webhook] Removed role assignments from old tenant for user: ${id}`);
      }

      // Sync tenant info to Clerk
      if (resolvedTenantId) {
        await syncTenantMetadataToClerk(id, resolvedTenantId);
      }

      console.log(`[Webhook] Updated user: ${id}, tenant: ${resolvedTenantId || "none"}`);
    }

    // ============================================
    // USER DELETED
    // ============================================
    if (eventType === "user.deleted") {
      // Delete user role assignments first
      await prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // Delete user from database
      try {
        await prisma.user.delete({
          where: { clerkId: id },
        });
        console.log(`[Webhook] Deleted user and role assignments: ${id}`);
      } catch (err) {
        // User might not exist in database
        console.log(`[Webhook] User not found in database for deletion: ${id}`);
      }
    }

    // ============================================
    // ORGANIZATION MEMBERSHIP CREATED (Clerk Organizations)
    // ============================================
    if (eventType === "organizationMembership.created") {
      const { organization, public_user_data } = evt.data;
      const userId = public_user_data?.user_id;
      const orgId = organization?.id;
      const orgSlug = organization?.slug;

      if (userId && (orgId || orgSlug)) {
        // Find tenant by Clerk org ID or slug
        const tenant = await prisma.tenant.findFirst({
          where: {
            OR: [
              { stripeCustomerId: orgId }, // If using Clerk org ID as reference
              { slug: orgSlug },
            ],
          },
        });

        if (tenant) {
          // Update user's tenant assignment
          await prisma.user.update({
            where: { clerkId: userId },
            data: { tenantId: tenant.id },
          });

          // Assign default role (Member)
          await assignDefaultRole(userId, tenant.id, "Member");

          // Sync to Clerk
          await syncTenantMetadataToClerk(userId, tenant.id);

          console.log(
            `[Webhook] Assigned user ${userId} to tenant ${tenant.slug} via organization membership`
          );
        }
      }
    }

    // ============================================
    // ORGANIZATION MEMBERSHIP DELETED
    // ============================================
    if (eventType === "organizationMembership.deleted") {
      const { organization, public_user_data } = evt.data;
      const userId = public_user_data?.user_id;
      const orgSlug = organization?.slug;

      if (userId) {
        // Find tenant
        const tenant = await prisma.tenant.findFirst({
          where: { slug: orgSlug },
        });

        if (tenant) {
          // Remove role assignments for this tenant
          await prisma.userRole.deleteMany({
            where: {
              userId: userId,
              tenantId: tenant.id,
            },
          });

          // Remove tenant from user
          await prisma.user.update({
            where: { clerkId: userId },
            data: { tenantId: null },
          });

          // Clear Clerk metadata
          try {
            const client = await clerkClient();
            await client.users.updateUserMetadata(userId, {
              publicMetadata: {
                tenantId: null,
                tenantName: null,
                tenantSlug: null,
                roles: [],
                permissions: [],
              },
            });
          } catch (err) {
            console.error("[Webhook] Failed to clear Clerk metadata:", err.message);
          }

          console.log(
            `[Webhook] Removed user ${userId} from tenant ${tenant.slug}`
          );
        }
      }
    }

    // ============================================
    // SESSION CREATED (Optional: Refresh metadata)
    // ============================================
    if (eventType === "session.created") {
      const userId = evt.data.user_id;
      
      // Get user with tenant info
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { tenantId: true },
      });

      // Sync latest tenant info on session start
      if (user?.tenantId) {
        await syncTenantMetadataToClerk(userId, user.tenantId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Assign default role to user in a tenant
 */
async function assignDefaultRole(userId, tenantId, roleAlias) {
  try {
    // Find the role in the tenant
    const role = await prisma.tenantRole.findFirst({
      where: {
        tenantId,
        roleAlias: {
          equals: roleAlias,
          mode: "insensitive",
        },
        isActive: true,
      },
    });

    if (!role) {
      const defaultRoleId = await getTenantDefaultRoleId(tenantId);
      if (defaultRoleId) {
        await createUserRoleAssignment(userId, tenantId, defaultRoleId);
        console.log(
          `[Webhook] Role "${roleAlias}" not found; assigned tenant default role to user ${userId}`
        );
      }
      return;
    }

    await createUserRoleAssignment(userId, tenantId, role.id);
    console.log(`[Webhook] Assigned role ${roleAlias} to user ${userId}`);
  } catch (error) {
    console.error("[Webhook] Failed to assign default role:", error.message);
  }
}

/**
 * Create user role assignment if not exists
 */
async function createUserRoleAssignment(userId, tenantId, tenantRoleId) {
  const existing = await prisma.userRole.findFirst({
    where: {
      userId,
      tenantRoleId,
    },
  });

  if (!existing) {
    await prisma.userRole.create({
      data: {
        userId,
        tenantId,
        tenantRoleId,
        assignedBy: "system",
      },
    });
  }
}

/**
 * Sync tenant information to Clerk user metadata
 * This allows the frontend to access tenant info without database queries
 */
async function syncTenantMetadataToClerk(userId, tenantId) {
  try {
    // Get tenant and user roles
    const [tenant, userRoles] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true, name: true, slug: true },
      }),
      prisma.userRole.findMany({
        where: {
          userId,
          tenantId,
          tenantRole: { isActive: true },
        },
        include: {
          tenantRole: {
            select: {
              roleAlias: true,
              tenantRolePermissions: {
                include: {
                  permission: {
                    select: { name: true, isActive: true },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    if (!tenant) return;

    // Collect roles and permissions
    const roles = userRoles.map((ur) => ur.tenantRole.roleAlias);
    const permissionSet = new Set();
    
    for (const ur of userRoles) {
      for (const trp of ur.tenantRole.tenantRolePermissions) {
        if (trp.permission.isActive) {
          permissionSet.add(trp.permission.name);
        }
      }
    }

    const permissions = Array.from(permissionSet);

    // Update Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        roles,
        permissions,
        // Include some frequently checked permissions for quick access
        canAccessAdminDashboard: permissions.includes("dashboard.admin"),
        canManageUsers: permissions.includes("users.create") || permissions.includes("users.update"),
        canManageContent: permissions.includes("quizzes.create") || permissions.includes("courses.create"),
      },
    });

    console.log(
      `[Webhook] Synced metadata to Clerk for user ${userId}: ${roles.length} roles, ${permissions.length} permissions`
    );
  } catch (error) {
    console.error("[Webhook] Failed to sync metadata to Clerk:", error.message);
  }
}

/**
 * Utility function to be called from other parts of the app
 * to sync user metadata after role changes
 */
export async function refreshUserClerkMetadata(userId, tenantId) {
  if (tenantId) {
    await syncTenantMetadataToClerk(userId, tenantId);
  }
}
