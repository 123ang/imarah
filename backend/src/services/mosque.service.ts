import type { MosqueType, Prisma, PublicMosqueStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const EARTH_KM = 6371;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_KM * c;
}

export type MosqueListFilters = {
  q?: string;
  stateId?: string;
  districtId?: string;
  type?: MosqueType;
  khairat?: boolean;
  oku?: boolean;
  hasParking?: boolean;
  facility?: string;
};

function publicWhere(): Prisma.MosqueWhereInput {
  return { deletedAt: null, publicStatus: "ACTIVE" as PublicMosqueStatus };
}

export async function listPublicMosques(filters: MosqueListFilters) {
  const where: Prisma.MosqueWhereInput = {
    ...publicWhere(),
    ...(filters.stateId ? { stateId: filters.stateId } : {}),
    ...(filters.districtId ? { districtId: filters.districtId } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.khairat !== undefined ? { khairatAvailable: filters.khairat } : {}),
    ...(filters.oku !== undefined ? { okuAccess: filters.oku } : {}),
    ...(filters.hasParking !== undefined
      ? filters.hasParking
        ? { parkingCapacity: { gt: 0 } }
        : { OR: [{ parkingCapacity: null }, { parkingCapacity: 0 }] }
      : {}),
    ...(filters.q
      ? {
          OR: [
            { nameBm: { contains: filters.q, mode: "insensitive" } },
            { nameEn: { contains: filters.q, mode: "insensitive" } },
            { addressLine1: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const items = await prisma.mosque.findMany({
    where,
    include: {
      state: true,
      district: true,
      prayerZone: true,
    },
    orderBy: { nameBm: "asc" },
    take: 200,
  });

  let out = items;
  if (filters.facility) {
    const f = filters.facility.toLowerCase();
    out = items.filter((m) => {
      const arr = (m.facilitiesJson as string[] | null) ?? [];
      return arr.some((x) => String(x).toLowerCase().includes(f));
    });
  }
  return out;
}

export async function getPublicMosque(id: string) {
  return prisma.mosque.findFirst({
    where: { id, ...publicWhere() },
    include: {
      state: true,
      district: true,
      prayerZone: true,
    },
  });
}

export async function nearestMosques(lat: number, lng: number, limit: number) {
  const items = await prisma.mosque.findMany({
    where: {
      ...publicWhere(),
      latitude: { not: null },
      longitude: { not: null },
    },
    include: { state: true, district: true, prayerZone: true },
  });
  const withDist = items
    .map((m) => {
      const la = Number(m.latitude);
      const lo = Number(m.longitude);
      return { ...m, distanceKm: haversineKm(lat, lng, la, lo) };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
  return withDist;
}
