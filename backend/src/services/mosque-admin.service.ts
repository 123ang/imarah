import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const jamaatBody = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  subuh: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  syuruk: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  zohor: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  asar: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  maghrib: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  isyak: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
});

export async function upsertMosqueJamaatTimes(mosqueId: string, body: unknown) {
  const data = jamaatBody.parse(body);
  const date = new Date(`${data.date}T12:00:00.000Z`);

  await prisma.mosqueJamaatTime.upsert({
    where: { mosqueId_date: { mosqueId, date } },
    create: {
      mosqueId,
      date,
      subuh: data.subuh ?? undefined,
      syuruk: data.syuruk ?? undefined,
      zohor: data.zohor ?? undefined,
      asar: data.asar ?? undefined,
      maghrib: data.maghrib ?? undefined,
      isyak: data.isyak ?? undefined,
    },
    update: {
      subuh: data.subuh ?? undefined,
      syuruk: data.syuruk ?? undefined,
      zohor: data.zohor ?? undefined,
      asar: data.asar ?? undefined,
      maghrib: data.maghrib ?? undefined,
      isyak: data.isyak ?? undefined,
    },
  });

  const row = await prisma.mosqueJamaatTime.findUnique({
    where: { mosqueId_date: { mosqueId, date } },
  });
  return row;
}
