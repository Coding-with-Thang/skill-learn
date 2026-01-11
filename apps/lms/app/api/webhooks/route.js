import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from '@skill-learn/database';
import { NextResponse } from "next/server";
import { handleApiError, AppError, ErrorType } from "@skill-learn/lib/utils/errorHandler.js";
import { successResponse } from "@skill-learn/lib/utils/apiWrapper.js";

export async function POST(req) {
  try {
    // Support both CLERK_WEBHOOK_SECRET (Vercel standard) and WEBHOOK_SECRET
    const WEBHOOK_SECRET =
      process.env.CLERK_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error(
        "[Webhook] CLERK_WEBHOOK_SECRET or WEBHOOK_SECRET is missing from environment variables"
      );
      throw new AppError(
        "Please add CLERK_WEBHOOK_SECRET (or WEBHOOK_SECRET) from Clerk Dashboard to .env or .env.local",
        ErrorType.API,
        { status: 500 }
      );
    }

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("[Webhook] Missing svix headers", {
        svix_id: !!svix_id,
        svix_timestamp: !!svix_timestamp,
        svix_signature: !!svix_signature,
      });
      throw new AppError(
        "Error occurred -- no svix headers",
        ErrorType.VALIDATION,
        {
          status: 400,
        }
      );
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error(
        "[Webhook] Error verifying webhook signature:",
        err.message
      );
      throw new AppError("Error verifying webhook", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const eventType = evt.type;
    const { id, public_metadata, private_metadata, ...attributes } = evt.data;

    if (eventType === "user.created" || eventType === "user.updated") {
      // Check if user has super_admin role in Clerk metadata
      const clerkRole = public_metadata?.role || public_metadata?.appRole;
      const isSuperAdmin = clerkRole === 'super_admin';

      // Build update object only with provided fields (skip null/undefined)
      const updateData = {};
      if (attributes.username !== null && attributes.username !== undefined) {
        updateData.username = attributes.username;
      }
      if (
        attributes.first_name !== null &&
        attributes.first_name !== undefined
      ) {
        updateData.firstName = attributes.first_name;
      }
      if (attributes.last_name !== null && attributes.last_name !== undefined) {
        updateData.lastName = attributes.last_name;
      }
      if (attributes.image_url !== null && attributes.image_url !== undefined) {
        updateData.imageUrl = attributes.image_url;
      }

      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: id },
        select: { id: true, role: true },
      });

      // For user.created: Always create user in database (for LMS access)
      // Super admin status is checked separately via Clerk metadata
      // IMPORTANT: Users cannot self-register as super_admin - only existing super admins can promote them
      if (eventType === "user.created") {
        // Check if email exists in attributes
        const email = attributes.email_addresses?.[0]?.email_address || null;

        await prisma.user.upsert({
          where: { clerkId: id },
          update: updateData,
          create: {
            clerkId: id,
            username: attributes.username || id,
            firstName: attributes.first_name || "",
            lastName: attributes.last_name || "",
            email: email,
            imageUrl: attributes.image_url || null,
            points: 0,
            lifetimePoints: 0,
            // Note: Role is not set to SUPER_ADMIN here - only Clerk metadata determines super admin status
            // This prevents self-registration as super admin
          },
        });

        if (isSuperAdmin) {
          console.log(
            `[Webhook] Created user ${id} with super_admin role in Clerk metadata (promoted by existing super admin)`
          );
        } else {
          console.log(
            `[Webhook] Created user ${id} (regular user - no super admin access)`
          );
        }
      }

      // For user.updated: Update user data
      if (eventType === "user.updated") {
        // Get email from attributes if available
        const email = attributes.email_addresses?.[0]?.email_address || null;
        if (email) {
          updateData.email = email;
        }

        await prisma.user.upsert({
          where: { clerkId: id },
          update: updateData,
          create: {
            clerkId: id,
            username: attributes.username || id,
            firstName: attributes.first_name || "",
            lastName: attributes.last_name || "",
            email: email,
            imageUrl: attributes.image_url || null,
            points: 0,
            lifetimePoints: 0,
          },
        });

        // Log super admin status changes
        if (isSuperAdmin && (!existingUser || existingUser.role !== 'SUPER_ADMIN')) {
          console.log(
            `[Webhook] User ${id} was promoted to super_admin (metadata updated by existing super admin)`
          );
        } else if (!isSuperAdmin && existingUser?.role === 'SUPER_ADMIN') {
          console.log(
            `[Webhook] User ${id} was demoted from super_admin`
          );
        }

        console.log(
          `[Webhook] Successfully updated user: ${id}`
        );
      }
    }

    if (eventType === "user.deleted") {
      await prisma.user.delete({
        where: { clerkId: id },
      });
      console.log(`[Webhook] Successfully deleted user: ${id}`);
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    return handleApiError(error);
  }
}
