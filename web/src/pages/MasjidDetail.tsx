import { startTransition, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { useLang } from "../hooks/useLang";
import type { MsgKey } from "../i18n/copy";
import { ApiError, apiGet } from "../lib/api";
import { malaysiaTodayIso } from "../lib/date";
import { pickLocaleText } from "../lib/locale-display";
import type { MosqueRow, PrayerMosqueResponse } from "../types/api";

function mapsUrl(lat: string, lng: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
}

function mapsAppleUrl(lat: string, lng: string): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}`;
}

function osmEmbedUrl(lat: number, lng: number): string {
  const delta = 0.02;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${encodeURIComponent(`${lat}%2C${lng}`)}`;
}

export function MasjidDetail() {
  const { id } = useParams();
  const { lang, t, ti } = useLang();
  const [mosque, setMosque] = useState<MosqueRow | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [prayerDate, setPrayerDate] = useState(() => malaysiaTodayIso());
  const [prayer, setPrayer] = useState<PrayerMosqueResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    startTransition(() => {
      setPhase("loading");
      setErrorMsg("");
    });
    apiGet<MosqueRow>(`/api/mosques/${id}`)
      .then((m) => {
        setMosque(m);
        setPhase("ready");
      })
      .catch((e: unknown) => {
        setMosque(null);
        if (e instanceof ApiError && e.status === 404) setPhase("missing");
        else {
          setPhase("error");
          setErrorMsg(e instanceof Error ? e.message : t("errGeneric"));
        }
      });
  }, [id, t]);

  useEffect(() => {
    if (!id) return;
    apiGet<PrayerMosqueResponse>(`/api/mosques/${id}/prayer-times?date=${encodeURIComponent(prayerDate)}`)
      .then(setPrayer)
      .catch(() => setPrayer(null));
  }, [id, prayerDate]);

  const prayerRows: { label: MsgKey; field: keyof NonNullable<PrayerMosqueResponse["official"]> }[] = [
    { label: "prayerLabelSubuh", field: "subuh" },
    { label: "prayerLabelSyuruk", field: "syuruk" },
    { label: "prayerLabelZohor", field: "zohor" },
    { label: "prayerLabelAsar", field: "asar" },
    { label: "prayerLabelMaghrib", field: "maghrib" },
    { label: "prayerLabelIsyak", field: "isyak" },
  ];

  if (phase === "loading") {
    return (
      <div className="mx-auto flex max-w-3xl justify-center px-4 py-16">
        <Spinner />
      </div>
    );
  }

  if (phase === "missing") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <PageMeta title={t("detail404")} />
        <p className="rounded-lg border border-imarah-border bg-imarah-panel p-4 text-imarah-muted">{t("detail404")}</p>
        <Link to="/masjid" className="mt-6 inline-block text-imarah-primary underline">
          ← {t("detailBackDirectory")}
        </Link>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{errorMsg}</p>
        <Link to="/masjid" className="mt-6 inline-block text-imarah-primary underline">
          ← {t("detailBackDirectory")}
        </Link>
      </div>
    );
  }

  if (!mosque) return null;

  const latStr = mosque.latitude ? String(mosque.latitude) : "";
  const lngStr = mosque.longitude ? String(mosque.longitude) : "";
  const latNum = Number.parseFloat(latStr);
  const lngNum = Number.parseFloat(lngStr);
  const hasCoords = latStr !== "" && lngStr !== "" && Number.isFinite(latNum) && Number.isFinite(lngNum);
  const displayName = pickLocaleText(lang, mosque.nameBm, mosque.nameEn);
  const showEnSub = lang === "ms" && mosque.nameEn?.trim();
  const districtLine = pickLocaleText(lang, mosque.district.nameBm, mosque.district.nameEn);
  const stateLine = pickLocaleText(lang, mosque.state.nameBm, mosque.state.nameEn);
  const facilities = mosque.facilitiesJson ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <PageMeta title={`${displayName} · IMARAH`} description={districtLine + ", " + stateLine} />

      <nav className="text-sm text-imarah-muted">
        <Link to="/masjid" className="hover:text-imarah-primary">
          {t("detailCrumbDirectory")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-imarah-ink">{displayName}</span>
      </nav>

      <header className="mt-4 border-b border-imarah-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-imarah-primary">
          {mosque.type === "MASJID" ? t("dirTypeMasjid") : t("dirTypeSurau")}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-imarah-deep sm:text-5xl">{displayName}</h1>
        {showEnSub ? <p className="mt-2 text-lg text-imarah-muted">{mosque.nameEn}</p> : null}
        <p className="mt-4 text-imarah-muted">
          {mosque.addressLine1}, {mosque.postcode}, {districtLine}, {stateLine}
        </p>
        {hasCoords ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={mapsUrl(latStr, lngStr)} target="_blank" rel="noreferrer" className="btn-primary inline-flex text-sm">
              Google Maps
            </a>
            <a
              href={mapsAppleUrl(latStr, lngStr)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg border-2 border-imarah-primary bg-white px-4 py-2 text-sm font-semibold text-imarah-primary"
            >
              Apple Maps
            </a>
          </div>
        ) : (
          <p className="mt-4 text-sm text-imarah-muted">{t("detailNoCoords")}</p>
        )}
      </header>

      {hasCoords ? (
        <section className="mt-10" aria-label={t("detailMap")}>
          <h2 className="font-display text-xl font-semibold text-imarah-deep">{t("detailMap")}</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-imarah-border shadow-sm">
            <iframe
              title={t("detailMap")}
              className="h-[220px] w-full md:h-[280px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={osmEmbedUrl(latNum, lngNum)}
            />
          </div>
          <p className="mt-2 text-xs text-imarah-muted">
            <a className="text-imarah-primary underline" href={`https://www.openstreetmap.org/?mlat=${latNum}&mlon=${lngNum}#map=17/${latNum}/${lngNum}`} target="_blank" rel="noreferrer">
              OpenStreetMap
            </a>
          </p>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-2xl font-semibold text-imarah-deep">{t("detailPrayerTitle")}</h2>
          <label className="field-label w-full shrink-0 sm:max-w-xs">
            <span className="text-xs font-normal">{t("detailPickDate")}</span>
            <input className="field-control" type="date" value={prayerDate} onChange={(e) => setPrayerDate(e.target.value)} />
          </label>
        </div>
        <p className="mt-2 text-sm text-imarah-muted">{ti("detailPrayerMeta", { date: prayerDate })}</p>
        {!prayer?.official ? (
          <p className="mt-4 rounded-lg border border-imarah-border bg-imarah-panel p-4 text-sm text-imarah-muted">
            {t("detailNoPrayer")}
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-imarah-border bg-white shadow-sm">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="bg-imarah-deep text-imarah-light">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("detailTableWhen")}</th>
                  <th className="px-4 py-3 font-medium">{t("detailTableOfficial")}</th>
                  <th className="px-4 py-3 font-medium">{t("detailTableJamaat")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-imarah-border">
                {prayerRows.map(({ label, field: key }) => {
                  const official = prayer.official![key];
                  const jamaatVal = prayer.jamaat?.[key];
                  return (
                    <tr key={label}>
                      <td className="px-4 py-2 font-medium text-imarah-deep">{t(label)}</td>
                      <td className="px-4 py-2 font-mono text-imarah-ink">{official}</td>
                      <td className="px-4 py-2 font-mono text-imarah-muted">{jamaatVal || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {prayer.next?.next ? (
              <p className="border-t border-imarah-border px-4 py-3 text-sm text-imarah-muted">
                {t("detailNextPrefix")}{" "}
                <strong className="text-imarah-ink">{prayer.next.next}</strong>
                {prayer.next.minutesRemaining != null ? ` · ≈ ${prayer.next.minutesRemaining} min` : ""}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-imarah-border bg-white p-4">
          <h3 className="font-semibold text-imarah-deep">{t("detailFacilities")}</h3>
          {facilities.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {facilities.map((f) => (
                <li key={f} className="rounded-full bg-imarah-light px-3 py-1 text-xs font-medium text-imarah-deep">
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-imarah-muted">{t("detailNoFacilities")}</p>
          )}
        </div>
        <div className="rounded-xl border border-imarah-border bg-white p-4">
          <h3 className="font-semibold text-imarah-deep">{t("detailContact")}</h3>
          <p className="mt-2 text-sm text-imarah-muted">
            {mosque.phone ? (
              <>
                {t("detailPhonePrefix")} {mosque.phone}
                <br />
              </>
            ) : null}
            {mosque.websiteUrl ? (
              <a href={mosque.websiteUrl} className="text-imarah-primary underline" target="_blank" rel="noreferrer">
                {t("detailWebsite")}
              </a>
            ) : (
              "—"
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
