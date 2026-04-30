import { Router } from "express";
import { z } from "zod";
import { logAudit } from "../lib/audit.js";
import { queryBoolean, routeParam } from "../lib/query.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { requireSuperOrMosqueAdminFor } from "../middleware/rbac.js";
import { upsertMosqueJamaatTimes } from "../services/mosque-admin.service.js";
import { getPublicMosque, listPublicMosques, nearestMosques } from "../services/mosque.service.js";
import { getPrayerForMosque, nextPrayerCountdown } from "../services/prayer.service.js";

export const mosqueRouter = Router();

const listQuery = z.object({
  q: z.string().optional(),
  stateId: z.string().optional(),
  districtId: z.string().optional(),
  type: z.enum(["MASJID", "SURAU"]).optional(),
  khairat: queryBoolean,
  oku: queryBoolean,
  hasParking: queryBoolean,
  facility: z.string().optional(),
});

mosqueRouter.get("/", async (req, res) => {
  const q = listQuery.safeParse(req.query);
  if (!q.success) return res.status(400).json({ error: q.error.flatten() });
  const items = await listPublicMosques(q.data);
  res.json({ items, total: items.length });
});

mosqueRouter.get("/nearby", async (req, res) => {
  const q = z
    .object({
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
      limit: z.coerce.number().min(1).max(50).optional(),
    })
    .safeParse(req.query);
  if (!q.success) return res.status(400).json({ error: q.error.flatten() });
  const items = await nearestMosques(q.data.lat, q.data.lng, q.data.limit ?? 20);
  res.json({ items, total: items.length });
});

mosqueRouter.patch("/:id/jamaat-times", requireAuth, requireSuperOrMosqueAdminFor("id"), async (req: AuthedRequest, res) => {
  try {
    const mosqueId = routeParam(req.params.id);
    if (!mosqueId) return res.status(400).json({ error: "ID diperlukan" });
    const row = await upsertMosqueJamaatTimes(mosqueId, req.body);
    logAudit({
      userId: req.userId,
      action: "JAMAAT_TIMES_UPSERT",
      entityType: "MosqueJamaatTime",
      entityId: row?.id ?? null,
      metadata: { mosqueId, date: (req.body as { date?: string })?.date },
      ip: req.ip,
    });
    res.json(row);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Ralat" });
  }
});

mosqueRouter.get("/:id/prayer-times", async (req, res) => {
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(req.query.date);
  if (!date.success) {
    return res.status(400).json({ error: "Query ?date=YYYY-MM-DD diperlukan" });
  }
  try {
    const { mosque, official, jamaat } = await getPrayerForMosque(req.params.id, date.data);
    if (!mosque) return res.status(404).json({ error: "Masjid tidak dijumpai" });
    let next = null as ReturnType<typeof nextPrayerCountdown> | null;
    if (official) {
      next = nextPrayerCountdown(official, date.data);
    }
    res.json({ mosqueId: mosque.id, date: date.data, official, jamaat, next });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ralat";
    res.status(400).json({ error: msg });
  }
});

mosqueRouter.get("/:id", async (req, res) => {
  const m = await getPublicMosque(req.params.id);
  if (!m) return res.status(404).json({ error: "Masjid tidak dijumpai" });
  res.json(m);
});
