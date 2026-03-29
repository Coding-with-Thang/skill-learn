import { AppError, ErrorType } from "./errorHandler";

const RESEND_API = "https://api.resend.com/emails";

function getAppName(): string {
  return process.env.PASSWORD_RECOVERY_APP_NAME?.trim() || "Skill-Learn";
}

/**
 * Sends a time-limited Clerk sign-in URL via Resend. The URL is never logged by this helper.
 */
export async function sendPasswordRecoveryEmail(params: {
  to: string;
  signInUrl: string;
  expiresInMinutes: number;
  recipientName?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(
      "Email delivery is not configured. Set RESEND_API_KEY to send secure sign-in links.",
      ErrorType.VALIDATION,
      { status: 503 }
    );
  }

  const from =
    process.env.PASSWORD_RECOVERY_FROM_EMAIL?.trim() ||
    "Skill-Learn <onboarding@resend.dev>";

  const appName = getAppName();
  const greeting = params.recipientName ? `Hello ${params.recipientName},` : "Hello,";

  const html = `
    <p>${greeting}</p>
    <p>An administrator requested a secure password reset for your ${appName} account.</p>
    <p>Use the button below to sign in once. After you sign in, you must choose a new password before you can continue—your old password will no longer work for normal sign-in.</p>
    <p><strong>This link expires in ${params.expiresInMinutes} minutes.</strong> If you did not expect this message, you can ignore it.</p>
    <p><a href="${params.signInUrl}" style="display:inline-block;margin:16px 0;padding:12px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Sign in securely</a></p>
    <p style="font-size:12px;color:#64748b;">If the button does not work, copy and paste this URL into your browser:<br/><span style="word-break:break-all;">${params.signInUrl}</span></p>
  `.trim();

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: `${appName}: Secure sign-in link (expires in ${params.expiresInMinutes} min)`,
      html,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new AppError(
      body?.message || `Failed to send recovery email (${res.status})`,
      ErrorType.UNKNOWN,
      { status: 502 }
    );
  }
}

/**
 * Sends the same Clerk sign-in URL via Twilio SMS (shorter copy; URL may still be long).
 */
export async function sendPasswordRecoverySms(params: {
  to: string;
  signInUrl: string;
  expiresInMinutes: number;
}): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!sid || !token || !from) {
    throw new AppError(
      "SMS delivery is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.",
      ErrorType.VALIDATION,
      { status: 503 }
    );
  }

  const appName = getAppName();
  const bodyText = `${appName}: Sign in once (expires in ${params.expiresInMinutes} min). You will set a new password next. ${params.signInUrl}`;

  const body = new URLSearchParams({
    To: params.to,
    From: from,
    Body: bodyText,
  });

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    throw new AppError(
      `Failed to send SMS (${res.status})${raw ? `: ${raw.slice(0, 200)}` : ""}`,
      ErrorType.UNKNOWN,
      { status: 502 }
    );
  }
}
