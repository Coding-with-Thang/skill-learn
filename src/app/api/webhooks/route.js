import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import prisma from "@/utils/connect";

export async function POST(req) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const payload = await req.text()
  const headerPayload = Object.fromEntries(headers())

  try {
    // Verify signature using svix (Clerk uses Svix under the hood)
    const wh = new Webhook(SIGNING_SECRET)
    const evt = wh.verify(payload, headerPayload)
    const eventType = evt.type
    const user = evt.data

    if (eventType === 'user.created') {
      await prisma.user.create({
        data: {
          clerkId: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          imageUrl: user.image_url,
        },
      })
    } else if (eventType === 'user.updated') {
      await prisma.user.update({
        where: { clerkId: user.id },
        data: {
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          imageUrl: user.image_url,
        },
      })
    } else if (eventType === 'user.deleted') {
      await prisma.user.delete({
        where: { clerkId: user.id },
      })
    } else {
      console.log('Unhandled Clerk event:', eventType)
    }

    return NextResponse.json({ message: 'Webhook processed securely' }, { status: 200 })
  } catch (err) {
    console.error('❌ Webhook verification failed:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 400 })
  }
}
