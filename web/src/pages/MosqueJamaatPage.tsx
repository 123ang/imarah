import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { useToast } from "../context/ToastContext";
import { apiPatch } from "../lib/api";
import { malaysiaTodayIso } from "../lib/date";
import type { MsgKey } from "../i18n/copy";
import { useLang } from "../hooks/useLang";

const slots = ["subuh", "syuruk", "zohor", "asar", "maghrib", "isyak"] as const;
const SLOT_KEY: Record<(typeof slots)[number], MsgKey> = {
  subuh: "prayerLabelSubuh",
  syuruk: "prayerLabelSyuruk",
  zohor: "prayerLabelZohor",
  asar: "prayerLabelAsar",
  maghrib: "prayerLabelMaghrib",
  isyak: "prayerLabelIsyak",
};

export function MosqueJamaatPage() {
  const { mosqueId } = useParams<{ mosqueId: string }>();
  const { t } = useLang();
  const { pushErr, pushInfo } = useToast();
  const [date, setDate] = useState(malaysiaTodayIso());
  const [times, setTimes] = useState<Record<(typeof slots)[number], string>>({
    subuh: "",
    syuruk: "",
    zohor: "",
    asar: "",
    maghrib: "",
    isyak: "",
  });
  const [busy, setBusy] = useState(false);

  if (!mosqueId) return null;

  async function save() {
    setBusy(true);
    try {
      const body: Record<string, unknown> = { date };
      for (const k of slots) {
        const v = times[k].trim();
        if (v) body[k] = v;
      }
      await apiPatch(`/api/mosques/${mosqueId}/jamaat-times`, body, { auth: true });
      pushInfo(t("jamaatSave"));
    } catch (e) {
      pushErr(e instanceof Error ? e.message : "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-imarah-border bg-white p-6 shadow-sm">
      <PageMeta title={t("mosqueJamaat")} />
      <label className="field-label mb-6">
        {t("jamaatDate")}
        <input className="field-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <p className="mb-4 text-xs text-imarah-muted">HH:mm — {t("jamaatOptional")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {slots.map((slot) => (
          <label key={slot} className="field-label">
            <span>{t(SLOT_KEY[slot])}</span>
            <input
              className="field-control font-mono"
              placeholder="13:45"
              value={times[slot]}
              onChange={(e) => setTimes((prev) => ({ ...prev, [slot]: e.target.value }))}
            />
          </label>
        ))}
      </div>
      <button type="button" className="btn-primary mt-6" disabled={busy} onClick={save}>
        {t("jamaatSave")}
      </button>
    </div>
  );
}
