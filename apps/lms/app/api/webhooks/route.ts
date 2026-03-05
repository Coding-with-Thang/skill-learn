import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@skill-learn/database";
import { type NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getTenantDefaultRoleId } from "@skill-learn/lib/utils/tenantDefaultRole";
import { logSecurityEvent } from "@skill-learn/lib/utils/security/logger";
import { SECURITY_EVENT_CATEGORIES, SECURITY_EVENT_TYPES } from "@skill-learn/lib/utils/security/eventTypes";

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
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Support both CLERK_WEBHOOK_SECRET (Vercel standard) and WEBHOOK_SECRET
    const WEBHOOK_SECRET =
      process.env.CLERK_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error(
        "[Webhook] CLERK_WEBHOOK_SECRET or WEBHOOK_SECRET is missing"
      );
      await logSecurityEvent({
        actorType: "system",
        eventType: SECURITY_EVENT_TYPES.WEBHOOK_PROCESSING_FAILED,
        category: SECURITY_EVENT_CATEGORIES.WEBHOOK,
        action: "process",
        resource: "clerk_webhook",
        outcome: "failure",
        severity: "high",
        message: "Webhook secret not configured",
        details: {
          reason: "missing_webhook_secret",
        },
        request: req,
      });
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
      await logSecurityEvent({
        actorType: "anonymous",
        eventType: SECURITY_EVENT_TYPES.WEBHOOK_VERIFICATION_FAILED,
        category: SECURITY_EVENT_CATEGORIES.WEBHOOK,
        action: "verify",
        resource: "clerk_webhook",
        outcome: "failure",
        severity: "high",
        message: "Missing required Svix headers",
        details: {
          hasSvixId: !!svix_id,
          hasSvixTimestamp: !!svix_timestamp,
          hasSvixSignature: !!svix_signature,
        },
        request: req,
      });
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 }
      );
    }

    const payload = (await req.json()) as Record<string, unknown>;
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: { type: string; data: Record<string, unknown> };

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as { type: string; data: Record<string, unknown> };
    } catch (err: unknown) {
      console.error("[Webhook] Verification failed:", err instanceof Error ? err.message : String(err));
      await logSecurityEvent({
        actorType: "anonymous",
        eventType: SECURITY_EVENT_TYPES.WEBHOOK_VERIFICATION_FAILED,
        category: SECURITY_EVENT_CATEGORIES.WEBHOOK,
        action: "verify",
        resource: "clerk_webhook",
        outcome: "failure",
        severity: "high",
        message: "Webhook signature verification failed",
        details: {
          error: err instanceof Error ? err.message : String(err),
          svixId: svix_id,
          svixTimestamp: svix_timestamp,
        },
        request: req,
      });
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 400 }
      );
    }

    const eventType = evt.type as string;
    const evtData = evt.data as {
      id?: string;
      public_metadata?: Record<string, unknown>;
      private_metadata?: Record<string, unknown>;
      email_addresses?: Array<{ email_address?: string }>;
      username?: string;
      first_name?: string;
      last_name?: string;
      image_url?: string;
      user_id?: string;
      organization?: { id?: string; slug?: string };
      public_user_data?: { user_id?: string };
    };
    const id = evtData.id;
    const public_metadata = evtData.public_metadata as Record<string, unknown> | undefined;
    const private_metadata = evtData.private_metadata as Record<string, unknown> | undefined;
    const attributes = evtData;
    const tenantIdMeta = (public_metadata?.tenantId ?? private_metadata?.tenantId) as string | undefined;
    const tenantSlugMeta = (public_metadata?.tenantSlug ?? private_metadata?.tenantSlug) as string | undefined;
    const defaultRoleMeta = (public_metadata?.defaultRole ?? private_metadata?.defaultRole) as string | undefined;

    console.log(`[Webhook] Processing event: ${eventType} for user: ${id ?? "unknown"}`);

    // ============================================
    // USER CREATED
    // ============================================
    if (eventType === "user.created" && id) {
      const email = attributes.email_addresses?.[0]?.email_address ?? null;

      const clerkRole = (public_metadata?.role ?? public_metadata?.appRole) as string | undefined;
      const isSuperAdmin = clerkRole === "super_admin";

      let resolvedTenantId: string | null = null;
      if (tenantIdMeta) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantIdMeta },
          select: { id: true },
        });
        if (tenant) resolvedTenantId = tenant.id;
      } else if (tenantSlugMeta) {
        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlugMeta },
          select: { id: true },
        });
        if (tenant) resolvedTenantId = tenant.id;
      }

      const updatePayload: Record<string, string | null> = {};
      if (attributes.username != null) updatePayload.username = attributes.username || null;
      if (attributes.first_name != null) updatePayload.firstName = attributes.first_name;
      if (attributes.last_name != null) updatePayload.lastName = attributes.last_name;
      if (email != null) updatePayload.email = email;
      if (attributes.image_url != null) updatePayload.imageUrl = attributes.image_url;
      if (resolvedTenantId != null) updatePayload.tenantId = resolvedTenantId;

      await prisma.user.upsert({
        where: { clerkId: id },
        update: updatePayload as Parameters<typeof prisma.user.upsert>[0]["update"],
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
        if (defaultRoleMeta) {
          await assignDefaultRole(id, resolvedTenantId, defaultRoleMeta);
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
        `[Webhook] Created user: ${id}, tenant: ${resolvedTenantId ?? "none"}, superAdmin: ${isSuperAdmin}`
      );
    }

    // ============================================
    // USER UPDATED
    // ============================================
    if (eventType === "user.updated" && id) {
      const email = attributes.email_addresses?.[0]?.email_address ?? null;

      const newTenantId = tenantIdMeta;
      const newTenantSlug = tenantSlugMeta;

      const existingUser = await prisma.user.findUnique({
        where: { clerkId: id },
        select: { id: true, tenantId: true },
      });

      let resolvedTenantId: string | null | undefined = existingUser?.tenantId ?? undefined;
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

      const tenantChanged = existingUser?.tenantId !== resolvedTenantId;

      const updateData: {
        username?: string;
        firstName?: string;
        lastName?: string;
        imageUrl?: string;
        email?: string;
        tenantId?: string | null;
      } = {};
      if (attributes.username !== undefined) updateData.username = attributes.username;
      if (attributes.first_name !== undefined) updateData.firstName = attributes.first_name;
      if (attributes.last_name !== undefined) updateData.lastName = attributes.last_name;
      if (attributes.image_url !== undefined) updateData.imageUrl = attributes.image_url;
      if (email !== undefined && email !== null) updateData.email = email;
      if (resolvedTenantId !== undefined) updateData.tenantId = resolvedTenantId;

      await prisma.user.upsert({
        where: { clerkId: id },
        update: updateData,
        create: {
          clerkId: id,
          username: attributes.username || id,
          firstName: attributes.first_name || "",
          lastName: attributes.last_name || "",
          email: email ?? null,
          imageUrl: attributes.image_url || null,
          tenantId: resolvedTenantId ?? null,
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
    if (eventType === "user.deleted" && id) {
      await prisma.userRole.deleteMany({
        where: { userId: id },
      });

      try {
        await prisma.user.delete({
          where: { clerkId: id },
        });
        console.log(`[Webhook] Deleted user and role assignments: ${id}`);
      } catch (err: unknown) {
        console.log(`[Webhook] User not found in database for deletion: ${id}`);
      }
    }

    // ============================================
    // ORGANIZATION MEMBERSHIP CREATED (Clerk Organizations)
    // ============================================
    if (eventType === "organizationMembership.created") {
      const orgData = evt.data as { organization?: { id?: string; slug?: string }; public_user_data?: { user_id?: string } };
      const userId = orgData.public_user_data?.user_id;
      const orgId = orgData.organization?.id;
      const orgSlug = orgData.organization?.slug;

      if (userId && (orgId || orgSlug)) {
        // Find tenant by Clerk org ID or slug
        const tenant = await prisma.tenant.findFirst({
          where: {
            OR: [
              ...(orgId != null ? [{ stripeCustomerId: orgId }] : []),
              ...(orgSlug != null ? [{ slug: orgSlug }] : []),
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
      const orgDelData = evt.data as { organization?: { slug?: string }; public_user_data?: { user_id?: string } };
      const userId = orgDelData.public_user_data?.user_id;
      const orgSlug = orgDelData.organization?.slug;

      if (userId && orgSlug) {
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
            console.error("[Webhook] Failed to clear Clerk metadata:", err instanceof Error ? err.message : String(err));
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
      const userId = (evt.data as { user_id?: string }).user_id;

      if (userId) {
        // Get user with tenant info
        const user = await prisma.user.findUnique({
          where: { clerkId: userId },
          select: { tenantId: true },
        });

        // Sync latest tenant info on session start
        if (user?.tenantId) {
          await syncTenantMetadataToClerk(userId, user.tenantId);
        }

        await logSecurityEvent({
          actorClerkId: userId,
          tenantId: user?.tenantId || undefined,
          eventType: SECURITY_EVENT_TYPES.AUTH_SESSION_CREATED,
          category: SECURITY_EVENT_CATEGORIES.AUTH,
          action: "authenticate",
          resource: "session",
          outcome: "success",
          severity: "low",
          message: "Session created via Clerk webhook",
          details: {
            provider: "clerk",
            webhookEventType: eventType,
          },
          request: req,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[Webhook] Error:", { message: err.message, stack: err.stack });
    await logSecurityEvent({
      actorType: "system",
      eventType: SECURITY_EVENT_TYPES.WEBHOOK_PROCESSING_FAILED,
      category: SECURITY_EVENT_CATEGORIES.WEBHOOK,
      action: "process",
      resource: "clerk_webhook",
      outcome: "failure",
      severity: "high",
      message: "Unhandled webhook processing failure",
      details: {
        error: err.message,
      },
      request: req,
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
async function assignDefaultRole(userId: string, tenantId: string, roleAlias: string): Promise<void> {
  try {
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
  } catch (error: unknown) {
    console.error("[Webhook] Failed to assign default role:", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Create user role assignment if not exists
 */
async function createUserRoleAssignment(userId: string, tenantId: string, tenantRoleId: string): Promise<void> {
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
 */
async function syncTenantMetadataToClerk(userId: string, tenantId: string): Promise<void> {
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

    const permissions = Array.from(permissionSet) as string[];

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
  } catch (error: unknown) {
    console.error("[Webhook] Failed to sync metadata to Clerk:", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Sync user metadata to Clerk after role changes (exported for use elsewhere).
 */
export async function refreshUserClerkMetadata(userId: string, tenantId: string | null | undefined): Promise<void> {
  if (tenantId) {
    await syncTenantMetadataToClerk(userId, tenantId);
  }
}
