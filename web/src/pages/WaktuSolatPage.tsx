import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { apiGet } from "../lib/api";
import { malaysiaTodayIso } from "../lib/date";
import { pickLocaleText } from "../lib/locale-display";
import type { Lang, MsgKey } from "../i18n/copy";
import { useLang } from "../hooks/useLang";
import type { PrayerTimeZoneResponse, PrayerZoneRow } from "../types/api";

const LS_ZONE = "imarah-solat-zone";
const LS_STATE = "imarah-solat-state";

function readInitialFilter() {
  if (typeof window === "undefined") return "";
  const sp = new URLSearchParams(window.location.search);
  return sp.get("stateId") ?? sp.get("state") ?? localStorage.getItem(LS_STATE) ?? "";
}

function readInitialZone() {
  if (typeof window === "undefined") return "";
  const sp = new URLSearchParams(window.location.search);
  return sp.get("zoneId") ?? sp.get("zone") ?? localStorage.getItem(LS_ZONE) ?? "";
}

function readInitialDate() {
  if (typeof window === "undefined") return malaysiaTodayIso();
  const sp = new URLSearchParams(window.location.search);
  return sp.get("date") ?? malaysiaTodayIso();
}

function uniqStates(zones: PrayerZoneRow[]): { id: string; nameBm: string; nameEn: string }[] {
  const m = new Map<string, { id: string; nameBm: string; nameEn: string }>();
  for (const z of zones) {
    if (!m.has(z.stateId)) {
      const s = z.state;
      m.set(z.stateId, { id: s.id, nameBm: s.nameBm, nameEn: s.nameEn });
    }
  }
  return [...m.values()].sort((a, b) => a.nameBm.localeCompare(b.nameBm, "ms"));
}

const SLOT_ROWS: { label: MsgKey; field: keyof PrayerTimeZoneResponse }[] = [
  { label: "prayerLabelSubuh", field: "subuh" },
  { label: "prayerLabelSyuruk", field: "syuruk" },
  { label: "prayerLabelZohor", field: "zohor" },
  { label: "prayerLabelAsar", field: "asar" },
  { label: "prayerLabelMaghrib", field: "maghrib" },
  { label: "prayerLabelIsyak", field: "isyak" },
];
const EMPTY_ZONES: PrayerZoneRow[] = [];

export function WaktuSolatPage() {
  const { lang, t } = useLang();
  const [, setSearchParams] = useSearchParams();

  const [filterStateId, setFilterStateId] = useState(readInitialFilter);
  const [zoneId, setZoneId] = useState(readInitialZone);
  const [date, setDate] = useState(readInitialDate);

  const zonesQuery = useQuery({
    queryKey: ["prayer-zones"],
    queryFn: () => apiGet<{ items: PrayerZoneRow[] }>("/api/prayer-times/zones"),
  });
  const zones = zonesQuery.data?.items ?? EMPTY_ZONES;

  useEffect(() => {
    localStorage.setItem(LS_ZONE, zoneId);
    localStorage.setItem(LS_STATE, filterStateId);
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        if (zoneId) {
          n.set("zoneId", zoneId);
          n.delete("zone");
        } else {
          n.delete("zoneId");
          n.delete("zone");
        }
        if (filterStateId) {
          n.set("stateId", filterStateId);
          n.delete("state");
        } else {
          n.delete("stateId");
          n.delete("state");
        }
        n.set("date", date);
        return n;
      },
      { replace: true },
    );
  }, [zoneId, filterStateId, date, setSearchParams]);

  const filteredZones = useMemo(() => {
    if (!filterStateId) return zones;
    return zones.filter((z) => z.stateId === filterStateId);
  }, [zones, filterStateId]);

  const states = useMemo(() => uniqStates(zones), [zones]);

  const zoneOptions = useMemo(
    () =>
      filteredZones.map((z) => ({
        id: z.id,
        label: `${z.zoneCode} — ${pickLocaleText(lang as Lang, z.zoneNameBm, z.zoneNameEn)}`,
      })),
    [filteredZones, lang],
  );

  const prayerQuery = useQuery({
    queryKey: ["prayer-zone-day", zoneId, date],
    queryFn: () =>
      apiGet<PrayerTimeZoneResponse>(
        `/api/prayer-times?zoneId=${encodeURIComponent(zoneId)}&date=${encodeURIComponent(date)}`,
      ),
    enabled: Boolean(zoneId && date),
  });
  const row = prayerQuery.data ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageMeta title={`${t("prayTitle")} · IMARAH`} />
      <h1 className="font-display text-4xl font-semibold text-imarah-deep">{t("prayTitle")}</h1>
      <p className="mt-2 max-w-2xl text-imarah-muted">{t("praySubtitle")}</p>

      {zonesQuery.isError ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p>{t("errGeneric")}</p>
          <button type="button" className="btn-primary mt-3 text-xs" onClick={() => void zonesQuery.refetch()}>
            {t("btnRetry")}
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 rounded-2xl border border-imarah-border bg-white p-4 shadow-sm md:grid-cols-4">
          <label className="field-label md:col-span-1">
            {t("prayFilterState")}
            <select className="field-control" value={filterStateId} onChange={(e) => setFilterStateId(e.target.value)}>
              <option value="">{t("dirAll")}</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {pickLocaleText(lang as Lang, s.nameBm, s.nameEn)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label md:col-span-2">
            {t("prayChooseZone")}
            <select className="field-control" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              <option value="">{t("prayZoneNeedsState")}</option>
              {zoneOptions.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label md:col-span-1">
            {t("prayDate")}
            <input className="field-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
      )}

      {!zonesQuery.isError ? (
        !zoneId ? (
          <p className="mt-10 text-imarah-muted">{t("prayZoneNeedsState")}</p>
        ) : prayerQuery.isLoading ? (
          <p className="mt-10 text-imarah-muted">{t("detailLoading")}</p>
        ) : !row ? (
          <p className="mt-10 text-imarah-muted">{t("prayNothing")}</p>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-xl border border-imarah-border bg-white shadow-sm">
            <table className="w-full min-w-[260px] text-left text-sm">
              <thead className="bg-imarah-deep text-imarah-light">
                <tr>
                  <th className="px-4 py-2">{t("detailTableWhen")}</th>
                  <th className="px-4 py-2">{t("detailTableOfficial")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-imarah-border">
                {SLOT_ROWS.map(({ label, field }) => (
                  <tr key={label}>
                    <td className="px-4 py-2 font-medium text-imarah-deep">{t(label)}</td>
                    <td className="px-4 py-2 font-mono">{String(row[field])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
}
