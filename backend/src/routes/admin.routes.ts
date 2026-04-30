import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { importPrayerCsv } from "../services/prayer-import.service.js";

export const adminRouter = Router();

adminRouter.post(
  "/prayer/import-csv",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (req, res) => {
    const body = z.object({ csv: z.string().min(1) }).safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: body.error.flatten() });
    try {
      const result = await importPrayerCsv(body.data.csv);
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Import failed" });
    }
  },
);
