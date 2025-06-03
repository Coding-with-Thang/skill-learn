import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
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
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  const eventType = evt.type;
  const { id, ...attributes } = evt.data;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    try {
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
          firstName: attributes.first_name || '',
          lastName: attributes.last_name || '',
          imageUrl: attributes.image_url,
        },
      });
    } catch (error) {
      console.error('Error upserting user:', error);
      return new Response('Error occurred', {
        status: 500
      });
    }
  }

  if (eventType === 'user.deleted') {
    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error occurred', {
        status: 500
      });
    }
  }

  return NextResponse.json({ success: true });
}
