import type { Response, NextFunction } from "express";
import { routeParam } from "../lib/query.js";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "./auth.js";

export async function loadRoleContext(userId: string) {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });
  const codes = rows.map((r) => r.role.code);
  const isSuperAdmin = codes.includes("SUPER_ADMIN");
  const mosqueIds = rows.filter((r) => r.mosqueId).map((r) => r.mosqueId!);
  const stateIds = rows.filter((r) => r.stateId).map((r) => r.stateId!);
  return { codes, isSuperAdmin, mosqueIds, stateIds };
}

export function requireRole(...allowedCodes: string[]) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) return res.status(401).json({ error: "Tidak dibenarkan" });
    const { codes } = await loadRoleContext(req.userId);
    if (!allowedCodes.some((c) => codes.includes(c))) {
      return res.status(403).json({ error: "Kebenaran tidak mencukupi" });
    }
    next();
  };
}

/** Mosque admin may act only for mosques listed on their UserRole; super admin bypasses. */
export function requireSuperOrMosqueAdminFor(param = "id") {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) return res.status(401).json({ error: "Tidak dibenarkan" });
    const mosqueId = routeParam(req.params[param]);
    if (!mosqueId) return res.status(400).json({ error: "ID masjid diperlukan" });
    const ctx = await loadRoleContext(req.userId);
    if (ctx.isSuperAdmin) return next();
    if (ctx.codes.includes("MOSQUE_ADMIN") && ctx.mosqueIds.includes(mosqueId)) return next();
    return res.status(403).json({ error: "Kebenaran tidak mencukupi untuk masjid ini" });
  };
}

/** Authority read access: user has state scope covering mosque's state, or super admin. */
export function requireSuperStateOrMosque(param = "id") {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) return res.status(401).json({ error: "Tidak dibenarkan" });
    const mosqueId = routeParam(req.params[param]);
    if (!mosqueId) return res.status(400).json({ error: "ID masjid diperlukan" });
    const ctx = await loadRoleContext(req.userId);
    if (ctx.isSuperAdmin) return next();
    const m = await prisma.mosque.findFirst({ where: { id: mosqueId, deletedAt: null }, select: { stateId: true } });
    if (!m) return res.status(404).json({ error: "Masjid tidak dijumpai" });
    if (ctx.codes.includes("MOSQUE_ADMIN") && ctx.mosqueIds.includes(mosqueId)) return next();
    if (ctx.codes.includes("AUTHORITY_OFFICER") && ctx.stateIds.includes(m.stateId)) return next();
    return res.status(403).json({ error: "Kebenaran tidak mencukupi" });
  };
}
