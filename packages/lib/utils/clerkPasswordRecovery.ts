import { clerkClient } from "@clerk/nextjs/server";
import { randomBytes } from "node:crypto";
import { MUST_CHANGE_PASSWORD_KEY } from "./clerkTemporaryPassword";
import { AppError, ErrorType } from "./errorHandler";
import { sendPasswordRecoveryEmail, sendPasswordRecoverySms } from "./passwordRecoveryDelivery";

type VerificationLike = { status: string } | null | undefined;

type EmailAddrLike = {
  id: string;
  emailAddress: string;
  verification: VerificationLike;
};

type PhoneLike = {
  id: string;
  phoneNumber: string;
  verification: VerificationLike;
};

function isVerified(v: VerificationLike): boolean {
  return v?.status === "verified";
}

export function getVerifiedPrimaryEmailFromClerkUser(user: {
  primaryEmailAddressId: string | null;
  emailAddresses: EmailAddrLike[];
}): string | null {
  if (!user.primaryEmailAddressId) return null;
  const ea = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
  if (!ea || !isVerified(ea.verification)) return null;
  return ea.emailAddress;
}

export function getVerifiedPrimaryPhoneFromClerkUser(user: {
  primaryPhoneNumberId: string | null;
  phoneNumbers: PhoneLike[];
}): string | null {
  if (!user.primaryPhoneNumberId) return null;
  const p = user.phoneNumbers.find((x) => x.id === user.primaryPhoneNumberId);
  if (!p || !isVerified(p.verification)) return null;
  return p.phoneNumber;
}

function resendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim();
}

function twilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
    process.env.TWILIO_AUTH_TOKEN?.trim() &&
    process.env.TWILIO_FROM_NUMBER?.trim()
  );
}

export type PasswordRecoveryDeliveryChannel = "email" | "sms";

function resolveDelivery(user: {
  primaryEmailAddressId: string | null;
  emailAddresses: EmailAddrLike[];
  primaryPhoneNumberId: string | null;
  phoneNumbers: PhoneLike[];
}): { channel: PasswordRecoveryDeliveryChannel; to: string } {
  const mode = (process.env.PASSWORD_RECOVERY_CHANNEL ?? "auto").toLowerCase();
  const email = getVerifiedPrimaryEmailFromClerkUser(user);
  const phone = getVerifiedPrimaryPhoneFromClerkUser(user);

  if (mode === "email") {
    if (!email || !resendConfigured()) {
      throw new AppError(
        "Password recovery by email requires a verified primary email on the user and RESEND_API_KEY in the environment.",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }
    return { channel: "email", to: email };
  }

  if (mode === "sms") {
    if (!phone || !twilioConfigured()) {
      throw new AppError(
        "Password recovery by SMS requires a verified primary phone on the user and Twilio environment variables.",
        ErrorType.VALIDATION,
        { status: 400 }
      );
    }
    return { channel: "sms", to: phone };
  }

  if (resendConfigured() && email) {
    return { channel: "email", to: email };
  }
  if (twilioConfigured() && phone) {
    return { channel: "sms", to: phone };
  }

  throw new AppError(
    "Cannot deliver a recovery link: the user needs a verified primary email (and RESEND_API_KEY), or a verified primary phone (and Twilio credentials).",
    ErrorType.VALIDATION,
    { status: 400 }
  );
}

async function revokeAllSessionsForUser(
  c: Awaited<ReturnType<typeof clerkClient>>,
  userId: string
): Promise<void> {
  let offset = 0;
  const limit = 100;
  for (;;) {
    const res = await c.sessions.getSessionList({ userId, limit, offset });
    const sessions = res.data;
    if (!sessions?.length) break;
    await Promise.all(sessions.map((s) => c.sessions.revokeSession(s.id)));
    if (sessions.length < limit) break;
    offset += sessions.length;
  }
}

/** Strong random password only used to invalidate the previous password; the user signs in via the delivered link, not this value. */
function rotationPassword(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Revokes sessions, rotates password (unknown to everyone), sets must-change, creates an expiring Clerk sign-in token, and delivers the URL OOB (email or SMS). Never returns the URL or password to the caller.
 */
export async function initiateOutOfBandPasswordRecovery(
  clerkUserId: string
): Promise<{
  expiresInSeconds: number;
  deliveryChannel: PasswordRecoveryDeliveryChannel;
}> {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);

  const { channel, to } = resolveDelivery(user);

  const ttlRaw = process.env.PASSWORD_RECOVERY_LINK_TTL_SECONDS;
  const parsed = ttlRaw ? Number.parseInt(ttlRaw, 10) : 3600;
  const expiresInSeconds = Number.isFinite(parsed)
    ? Math.min(Math.max(300, parsed), 24 * 3600)
    : 3600;

  await revokeAllSessionsForUser(client, clerkUserId);

  await client.users.updateUser(clerkUserId, {
    password: rotationPassword(),
    signOutOfOtherSessions: true,
    skipPasswordChecks: true,
  });

  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { [MUST_CHANGE_PASSWORD_KEY]: true },
  });

  const signInToken = await client.signInTokens.createSignInToken({
    userId: clerkUserId,
    expiresInSeconds,
  });

  const signInUrl = signInToken.url;
  const expiresInMinutes = Math.ceil(expiresInSeconds / 60);
  const recipientName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || undefined;

  if (channel === "email") {
    await sendPasswordRecoveryEmail({
      to,
      signInUrl,
      expiresInMinutes,
      recipientName,
    });
  } else {
    await sendPasswordRecoverySms({
      to,
      signInUrl,
      expiresInMinutes,
    });
  }

  return { expiresInSeconds, deliveryChannel: channel };
}
