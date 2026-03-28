import { prisma } from "@skill-learn/database";

/** True unless the user was explicitly deactivated (isActive === false). */
export function isUserRecordActive(isActive: boolean | null | undefined): boolean {
  return isActive !== false;
}

/**
 * Count users in a tenant who may access the LMS (not explicitly deactivated).
 */
export async function countActiveTenantUsers(
  tenantId: string,
  options?: { excludeUserId?: string }
): Promise<number> {
  const andClause: Array<{ NOT: Record<string, unknown> }> = [
    { NOT: { isActive: false } },
  ];
  if (options?.excludeUserId) {
    andClause.push({ NOT: { id: options.excludeUserId } });
  }
  return prisma.user.count({
    where: {
      tenantId,
      AND: andClause,
    },
  });
}
