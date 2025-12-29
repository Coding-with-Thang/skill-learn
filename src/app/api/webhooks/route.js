import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";
import { handleApiError, AppError, ErrorType } from "@/utils/errorHandler";
import { successResponse } from "@/utils/apiWrapper";

export async function POST(req) {
  try {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new AppError(
        "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
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
      throw new AppError("Error verifying webhook", ErrorType.VALIDATION, {
        status: 400,
      });
    }

    const eventType = evt.type;
    const { id, ...attributes } = evt.data;

    if (eventType === "user.created" || eventType === "user.updated") {
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          username: attributes.username,
          firstName: attributes.first_name,
          lastName: attributes.last_name,
          imageUrl: attributes.image_url,
        },
        create: {
          clerkId: id,
          username: attributes.username || id,
          firstName: attributes.first_name || "",
          lastName: attributes.last_name || "",
          imageUrl: attributes.image_url,
          points: 0,
          lifetimePoints: 0,
        },
      });
    }

    if (eventType === "user.deleted") {
      await prisma.user.delete({
        where: { clerkId: id },
      });
    }

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
