import type { Lang } from "../i18n/copy";

/** Pick English when selected and provided; fallback to Malay. */
export function pickLocaleText(lang: Lang, nameBm: string, nameEn: string | null | undefined): string {
  const en = nameEn?.trim();
  return lang === "en" && en ? en : nameBm;
}
