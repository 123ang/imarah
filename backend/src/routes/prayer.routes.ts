import { Router } from "express";
import { z } from "zod";
import { getPrayerForZone, listZones } from "../services/prayer.service.js";

export const prayerRouter = Router();

prayerRouter.get("/zones", async (_req, res) => {
  const zones = await listZones();
  res.json({ items: zones });
});

prayerRouter.get("/", async (req, res) => {
  const q = z
    .object({
      zoneId: z.string().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .safeParse(req.query);
  if (!q.success) return res.status(400).json({ error: "zoneId dan date (YYYY-MM-DD) diperlukan" });
  try {
    const row = await getPrayerForZone(q.data.zoneId, q.data.date);
    if (!row) return res.status(404).json({ error: "Tiada data waktu solat" });
    res.json(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ralat";
    res.status(400).json({ error: msg });
  }
});
