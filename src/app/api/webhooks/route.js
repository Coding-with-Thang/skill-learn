import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import prisma from "@/utils/connect";

export async function POST(req) {
  try {
    // Add this for testing - REMOVE in production
    const testMode = req.headers.get('x-test-mode');
    if (testMode === 'true') {
      console.log('Test mode - bypassing verification');
      return new Response(JSON.stringify({ 
        status: 'success', 
        message: 'Endpoint is reachable',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Normal webhook verification
    const webhookSecret = process.env.SIGNING_SECRET;
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not found');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    const headers = {
      'svix-id': req.headers.get('svix-id'),
      'svix-timestamp': req.headers.get('svix-timestamp'),
      'svix-signature': req.headers.get('svix-signature'),
    };

    // Check if required headers exist
    if (!headers['svix-id'] || !headers['svix-timestamp'] || !headers['svix-signature']) {
      console.error('Missing required webhook headers');
      return new Response('Missing webhook headers', { status: 400 });
    }

    const body = await req.text();
    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(body, headers);
    
    console.log('Webhook verified:', evt.type);
    // Your webhook logic here
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// export async function POST(req) {
//   const SIGNING_SECRET = process.env.SIGNING_SECRET;
//   const payload = await req.text()
//   const headerList = await headers()

//   // Explicitly extract the required headers
//   const svixHeaders = {
//     'svix-id': headerList.get('svix-id'),
//     'svix-timestamp': headerList.get('svix-timestamp'),
//     'svix-signature': headerList.get('svix-signature'),
//   }

//   if (!SIGNING_SECRET || !svixHeaders['svix-signature']) {
//     return NextResponse.json('Missing secret or headers', { status: 400 })
//   }

//   try {
//     const wh = new Webhook(SIGNING_SECRET)
//     const evt = wh.verify(payload, svixHeaders) // will throw if invalid
//     const eventType = evt.type
//     const user = evt.data

//     if (['user.created', 'user.updated'].includes(eventType)) {
//       const existingUser = await prisma.user.findFirst({
//         where: { clerkId: user.id },
//       })

//       const userData = {
//         username: user.username,
//         firstName: user.first_name,
//         lastName: user.last_name,
//         imageUrl: user.image_url,
//       }

//       if (existingUser) {
//         console.log('🔁 Updating user in DB:', user.id)
//         await prisma.user.update({
//           where: { clerkId: user.id },
//           data: userData,
//         })
//       } else {
//         console.log('🆕 Creating new user in DB:', user.id)
//         await prisma.user.create({
//           data: {
//             clerkId: user.id,
//             ...userData,
//           },
//         })
//       }
//     } else if (eventType === 'user.deleted') {
//       console.log('🗑️ Deleting user from DB:', user.id)
//       await prisma.user.deleteMany({
//         where: { clerkId: user.id },
//       })
//     }

//     return NextResponse.json({ message: 'User sync successful' }, { status: 200 })
//   } catch (err) {
//     console.error('❌ Webhook verification failed:', err)
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 400 })
//   }
// }
