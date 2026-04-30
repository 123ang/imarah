import { Router } from "express";
import { z } from "zod";
import { logAudit } from "../lib/audit.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { inviteMosqueAdmin } from "../services/admin-invite.service.js";
import { enqueueJakimSyncStub } from "../services/jakim-sync.service.js";
import { importPrayerCsv, importPrayerJson } from "../services/prayer-import.service.js";

export const adminRouter = Router();

adminRouter.post(
  "/prayer/import-csv",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (req: AuthedRequest, res) => {
    const body = z.object({ csv: z.string().min(1) }).safeParse(req.body);
    if (!body.success) return res.status(400).json({ error: body.error.flatten() });
    try {
      const result = await importPrayerCsv(body.data.csv);
      logAudit({
        userId: req.userId,
        action: "PRAYER_TIMES_IMPORTED_CSV",
        entityType: "ImportBatch",
        metadata: { imported: result.imported, errors: result.errors.length },
        ip: req.ip,
      });
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Import failed" });
    }
  },
);

adminRouter.post(
  "/prayer/import-json",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (req: AuthedRequest, res) => {
    try {
      const result = await importPrayerJson(req.body);
      logAudit({
        userId: req.userId,
        action: "PRAYER_TIMES_IMPORTED_JSON",
        entityType: "ImportBatch",
        metadata: { imported: result.imported, errors: result.errors.length },
        ip: req.ip,
      });
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Import failed" });
    }
  },
);

adminRouter.post(
  "/jakim/sync",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (req: AuthedRequest, res) => {
    try {
      const job = await enqueueJakimSyncStub();
      logAudit({
        userId: req.userId,
        action: "JAKIM_SYNC_STUB",
        entityType: "JakimSyncJob",
        entityId: job.jobId,
        ip: req.ip,
      });
      res.json(job);
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : "Sync failed" });
    }
  },
);

adminRouter.post(
  "/invite-mosque-admin",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  async (req: AuthedRequest, res) => {
    try {
      const out = await inviteMosqueAdmin(req.body, req.userId!, req.ip);
      res.status(201).json(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ralat";
      const status = msg.includes("sudah") ? 409 : 400;
      res.status(status).json({ error: msg });
    }
  },
);
