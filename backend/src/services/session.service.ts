import { prisma } from "../lib/prisma.js";

/** Current user snapshot for SPA guards (roles + mosque/state scopes). */
export async function getSessionUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      fullName: true,
      languagePref: true,
      emailVerifiedAt: true,
      roles: {
        select: {
          mosqueId: true,
          stateId: true,
          role: { select: { code: true } },
        },
      },
    },
  });
  if (!user) return null;

  const roleCodes = [...new Set(user.roles.map((r) => r.role.code))];
  const mosqueIds = [...new Set(user.roles.map((r) => r.mosqueId).filter((id): id is string => !!id))];
  const stateIds = [...new Set(user.roles.map((r) => r.stateId).filter((id): id is string => !!id))];

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    languagePref: user.languagePref,
    emailVerified: !!user.emailVerifiedAt,
    roles: roleCodes,
    mosqueIds,
    stateIds,
  };
}
