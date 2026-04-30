import type { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "./auth.js";

export function requireRole(...allowedCodes: string[]) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) return res.status(401).json({ error: "Tidak dibenarkan" });
    const rows = await prisma.userRole.findMany({
      where: { userId: req.userId },
      include: { role: true },
    });
    const codes = rows.map((r) => r.role.code);
    if (!allowedCodes.some((c) => codes.includes(c))) {
      return res.status(403).json({ error: "Kebenaran tidak mencukupi" });
    }
    next();
  };
}
