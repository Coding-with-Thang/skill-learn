import { clerkClient } from "@clerk/nextjs/server";

/**
 * Clerk public metadata flag: user must change password after signing in with a temporary password.
 */
export const MUST_CHANGE_PASSWORD_KEY = "mustChangePassword" as const;

export function readMustChangePasswordFlag(publicMetadata: unknown): boolean {
  if (!publicMetadata || typeof publicMetadata !== "object") return false;
  return (publicMetadata as { mustChangePassword?: boolean }).mustChangePassword === true;
}

export async function clearMustChangePasswordFlag(clerkUserId: string): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { [MUST_CHANGE_PASSWORD_KEY]: false },
  });
}
