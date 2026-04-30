export type StateRow = {
  id: string;
  code: string;
  nameBm: string;
  nameEn: string;
};

export type DistrictRow = {
  id: string;
  stateId: string;
  nameBm: string;
  nameEn: string;
};

export type MosqueRow = {
  id: string;
  type: "MASJID" | "SURAU";
  nameBm: string;
  nameEn: string | null;
  addressLine1: string;
  postcode: string;
  latitude: string | null;
  longitude: string | null;
  phone: string | null;
  websiteUrl: string | null;
  khairatAvailable: boolean;
  okuAccess: boolean;
  parkingCapacity: number | null;
  facilitiesJson: string[] | null;
  state: StateRow;
  district: DistrictRow;
  distanceKm?: number;
};

export type PrayerOfficial = {
  subuh: string;
  syuruk: string;
  zohor: string;
  asar: string;
  maghrib: string;
  isyak: string;
};

export type PrayerMosqueResponse = {
  mosqueId: string;
  date: string;
  official: PrayerOfficial | null;
  jamaat: Partial<PrayerOfficial> | null;
  next: { next: string | null; minutesRemaining: number | null } | null;
};
