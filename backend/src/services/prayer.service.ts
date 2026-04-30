import { malaysiaPrayerInstant, prayerDateForDb } from "../lib/malaysia-time.js";
import { prisma } from "../lib/prisma.js";

export async function listZones() {
  return prisma.prayerZone.findMany({
    where: { isActive: true },
    include: { state: true },
    orderBy: [{ stateId: "asc" }, { zoneCode: "asc" }],
  });
}

export async function getPrayerForZone(zoneId: string, dateStr: string) {
  const date = prayerDateForDb(dateStr);
  return prisma.prayerTime.findUnique({
    where: { zoneId_date: { zoneId, date } },
    include: { zone: { include: { state: true } } },
  });
}

export async function getPrayerForMosque(mosqueId: string, dateStr: string) {
  const date = prayerDateForDb(dateStr);
  const mosque = await prisma.mosque.findFirst({
    where: { id: mosqueId, deletedAt: null, publicStatus: "ACTIVE" },
    include: { prayerZone: true },
  });
  if (!mosque?.prayerZoneId) {
    return { mosque, official: null, jamaat: null };
  }
  const [official, jamaat] = await Promise.all([
    prisma.prayerTime.findUnique({
      where: { zoneId_date: { zoneId: mosque.prayerZoneId, date } },
    }),
    prisma.mosqueJamaatTime.findUnique({
      where: { mosqueId_date: { mosqueId, date } },
    }),
  ]);
  return { mosque, official, jamaat };
}

const PRAYER_KEYS = ["subuh", "syuruk", "zohor", "asar", "maghrib", "isyak"] as const;

export function nextPrayerCountdown(
  official: { subuh: string; syuruk: string; zohor: string; asar: string; maghrib: string; isyak: string },
  dateStr: string,
  now = new Date(),
): { next: string | null; minutesRemaining: number | null } {
  const slots = PRAYER_KEYS.map((k) => ({
    name: k,
    at: malaysiaPrayerInstant(dateStr, official[k]).getTime(),
  }));
  const nowMs = now.getTime();
  const upcoming = slots.find((s) => s.at > nowMs);
  if (!upcoming) return { next: null, minutesRemaining: null };
  return {
    next: upcoming.name,
    minutesRemaining: Math.round((upcoming.at - nowMs) / 60000),
  };
}
