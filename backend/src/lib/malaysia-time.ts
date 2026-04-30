export const MALAYSIA_TIME_ZONE = "Asia/Kuala_Lumpur";
const MALAYSIA_UTC_OFFSET_HOURS = 8;

export function parseIsoDateParts(dateStr: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) throw new Error("Format tarikh tidak sah (YYYY-MM-DD)");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
    throw new Error("Tarikh tidak sah");
  }
  return { year, month, day };
}

export function parsePrayerTimeParts(time: string): { hour: number; minute: number } {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) throw new Error("Format masa tidak sah (HH:mm)");
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Masa tidak sah");
  }
  return { hour, minute };
}

export function prayerDateForDb(dateStr: string): Date {
  const { year, month, day } = parseIsoDateParts(dateStr);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

export function malaysiaPrayerInstant(dateStr: string, time: string): Date {
  const { year, month, day } = parseIsoDateParts(dateStr);
  const { hour, minute } = parsePrayerTimeParts(time);
  return new Date(Date.UTC(year, month - 1, day, hour - MALAYSIA_UTC_OFFSET_HOURS, minute, 0, 0));
}
