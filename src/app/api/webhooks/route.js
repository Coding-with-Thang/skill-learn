import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/utils/connect";

export async function POST(req) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;
  const payload = await req.text();
  const headerList = headers();

  // Add request validation
  if (!payload || !headerList) {
    return NextResponse.json("Invalid request", { status: 400 });
  }

  // Rate limiting
  const clientIp =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for") ||
    req.socket.remoteAddress;
  const rateLimitKey = `rate-limit:${clientIp}`;
  const rateLimit = await prisma.rateLimit.findUnique({
    where: { id: rateLimitKey },
  });

  if (rateLimit && rateLimit.count >= 100) {
    return NextResponse.json("Too many requests", { status: 429 });
  }

  // IP whitelisting
  const WHITELISTED_IPS = process.env.WHITELISTED_IPS?.split(",") || [];
  if (!WHITELISTED_IPS.includes(clientIp)) {
    return NextResponse.json("Forbidden", { status: 403 });
  }

  // Add retry logic for database operations
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Explicitly extract the required headers
      const svixHeaders = {
        "svix-id": headerList.get("svix-id"),
        "svix-timestamp": headerList.get("svix-timestamp"),
        "svix-signature": headerList.get("svix-signature"),
      };

      if (!SIGNING_SECRET || !svixHeaders["svix-signature"]) {
        return NextResponse.json("Missing secret or headers", { status: 400 });
      }

      const wh = new Webhook(SIGNING_SECRET);
      const evt = wh.verify(payload, svixHeaders); // will throw if invalid
      const eventType = evt.type;
      const user = evt.data;

      if (["user.created", "user.updated"].includes(eventType)) {
        const existingUser = await prisma.user.findFirst({
          where: { clerkId: user.id },
        });

        const userData = {
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          imageUrl: user.image_url,
        };

        if (existingUser) {
          console.log("🔁 Updating user in DB:", user.id);
          await prisma.user.update({
            where: { clerkId: user.id },
            data: userData,
          });
        } else {
          console.log("🆕 Creating new user in DB:", user.id);
          await prisma.user.create({
            data: {
              clerkId: user.id,
              ...userData,
            },
          });
        }
      } else if (eventType === "user.deleted") {
        console.log("🗑️ Deleting user from DB:", user.id);
        await prisma.user.deleteMany({
          where: { clerkId: user.id },
        });
      }

      // Update or create rate limit entry
      if (rateLimit) {
        await prisma.rateLimit.update({
          where: { id: rateLimitKey },
          data: { count: { increment: 1 } },
        });
      } else {
        await prisma.rateLimit.create({
          data: { id: rateLimitKey, count: 1 },
        });
      }

      return NextResponse.json(
        { message: "User sync successful" },
        { status: 200 }
      );
    } catch (error) {
      retries++;
      if (retries === MAX_RETRIES) {
        // Log to error monitoring service
        console.error("Webhook processing failed after max retries:", error);
        return NextResponse.json("Processing failed", { status: 500 });
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
    }
  }
}
