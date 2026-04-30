import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const metaRouter = Router();

metaRouter.get("/states", async (_req, res) => {
  const items = await prisma.state.findMany({ orderBy: { nameBm: "asc" } });
  res.json({ items });
});

metaRouter.get("/districts", async (req, res) => {
  const stateId = typeof req.query.stateId === "string" ? req.query.stateId : undefined;
  if (!stateId) return res.status(400).json({ error: "stateId diperlukan" });
  const items = await prisma.district.findMany({
    where: { stateId },
    orderBy: { nameBm: "asc" },
  });
  res.json({ items });
});
