import { startTransition, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { useLang } from "../hooks/useLang";
import { apiGet } from "../lib/api";
import { malaysiaTodayIso } from "../lib/date";
import { pickLocaleText } from "../lib/locale-display";
import type { DistrictRow, MosqueRow, StateRow } from "../types/api";

export function MasjidDirectory() {
  const { lang, t } = useLang();
  const [states, setStates] = useState<StateRow[]>([]);
  const [districts, setDistricts] = useState<DistrictRow[]>([]);
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | "MASJID" | "SURAU">("");
  const [khairat, setKhairat] = useState<boolean | "">("");
  const [oku, setOku] = useState<boolean | "">("");
  const [items, setItems] = useState<MosqueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearbyLat, setNearbyLat] = useState("");
  const [nearbyLng, setNearbyLng] = useState("");
  const [statesError, setStatesError] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{ items: StateRow[] }>("/api/meta/states")
      .then((d) => {
        setStates(d.items);
        setStatesError(null);
      })
      .catch(() => setStatesError(t("dirErrorStates")));
  }, [t]);

  useEffect(() => {
    if (!stateId) {
      startTransition(() => {
        setDistricts([]);
        setDistrictId("");
      });
      return;
    }
    apiGet<{ items: DistrictRow[] }>(`/api/meta/districts?stateId=${encodeURIComponent(stateId)}`)
      .then((d) => setDistricts(d.items))
      .catch(() => {});
  }, [stateId]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (stateId) p.set("stateId", stateId);
    if (districtId) p.set("districtId", districtId);
    if (type) p.set("type", type);
    if (khairat === true) p.set("khairat", "true");
    if (oku === true) p.set("oku", "true");
    return p.toString();
  }, [q, stateId, districtId, type, khairat, oku]);

  useEffect(() => {
    const path = queryString ? `/api/mosques?${queryString}` : "/api/mosques";
    /* Show list skeleton whenever filters change — sync loading flag is deliberate UX. */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading/error reset tied to dependency change
    setLoading(true);
    setError(null);
    void apiGet<{ items: MosqueRow[] }>(path)
      .then((d) => setItems(d.items))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [queryString]);

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setError(t("geoUnsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setNearbyLat(lat.toFixed(5));
        setNearbyLng(lng.toFixed(5));
        setLoading(true);
        try {
          const d = await apiGet<{ items: MosqueRow[] }>(
            `/api/mosques/nearby?lat=${lat}&lng=${lng}&limit=20`,
          );
          setItems(d.items);
          setError(null);
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : t("errGeneric"));
        } finally {
          setLoading(false);
        }
      },
      () => setError(t("geoDenied")),
    );
  }

  const showEmptyBanner = !loading && !error && items.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageMeta title={`${t("dirTitle")} · IMARAH`} />

      <header className="border-b border-imarah-border pb-8">
        <h1 className="font-display text-4xl font-semibold text-imarah-deep sm:text-5xl">{t("dirTitle")}</h1>
        <p className="mt-3 max-w-2xl text-imarah-muted">{t("dirIntro")}</p>
      </header>

      {statesError ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p>{statesError}</p>
          <button
            type="button"
            className="btn-primary mt-3 text-xs"
            onClick={() => {
              void apiGet<{ items: StateRow[] }>("/api/meta/states")
                .then((d) => {
                  setStates(d.items);
                  setStatesError(null);
                })
                .catch(() => setStatesError(t("dirErrorStates")));
            }}
          >
            {t("btnRetry")}
          </button>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 rounded-2xl border border-imarah-border bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="field-label">
            <span>{t("dirSearchLabel")}</span>
            <input
              className="field-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("dirSearchPlaceholder")}
            />
          </label>
          <label className="field-label">
            <span>{t("dirStateLabel")}</span>
            <select className="field-control" value={stateId} onChange={(e) => setStateId(e.target.value)}>
              <option value="">{t("dirAll")}</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {pickLocaleText(lang, s.nameBm, s.nameEn)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            <span>{t("dirDistrictLabel")}</span>
            <select
              className="field-control"
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              disabled={!stateId}
            >
              <option value="">{t("dirAll")}</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {pickLocaleText(lang, d.nameBm, d.nameEn)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            <span>{t("dirTypeLabel")}</span>
            <select className="field-control" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="">{t("dirAll")}</option>
              <option value="MASJID">{t("dirTypeMasjid")}</option>
              <option value="SURAU">{t("dirTypeSurau")}</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-imarah-ink">
            <input
              type="checkbox"
              checked={khairat === true}
              onChange={() => setKhairat((v) => (v === true ? "" : true))}
            />
            Khairat
          </label>
          <label className="flex items-center gap-2 text-sm text-imarah-ink">
            <input type="checkbox" checked={oku === true} onChange={() => setOku((v) => (v === true ? "" : true))} />
            OKU
          </label>
          <button type="button" className="btn-primary text-sm" onClick={useMyLocation}>
            {t("dirNearMe")}
          </button>
          {nearbyLat && nearbyLng ? (
            <span className="text-xs text-imarah-muted">
              GPS: {nearbyLat}, {nearbyLng}
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p>{error}</p>
          <button
            type="button"
            className="btn-primary mt-3 text-xs"
            onClick={() => {
              const path = queryString ? `/api/mosques?${queryString}` : "/api/mosques";
              setLoading(true);
              setError(null);
              void apiGet<{ items: MosqueRow[] }>(path)
                .then((d) => setItems(d.items))
                .catch((e: Error) => setError(e.message))
                .finally(() => setLoading(false));
            }}
          >
            {t("btnRetry")}
          </button>
        </div>
      ) : null}

      <p className="mt-6 text-sm text-imarah-muted">
        {t("dirRefDateLabel")} <strong>{malaysiaTodayIso()}</strong> {t("dirRefDateNote")}
      </p>

      {!statesError && !error && loading ? (
        <p className="mt-8 text-imarah-muted">{t("dirLoading")}</p>
      ) : (
        !error && (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {items.map((m) => {
              const title = pickLocaleText(lang, m.nameBm, m.nameEn);
              const showSub = lang === "ms" && m.nameEn?.trim();
              return (
                <li key={m.id}>
                  <Link
                    to={`/masjid/${m.id}`}
                    className="block rounded-2xl border border-imarah-border bg-white p-5 shadow-sm transition hover:border-imarah-primary/50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-imarah-primary">
                          {m.type === "MASJID" ? t("dirTypeMasjid") : t("dirTypeSurau")}
                        </span>
                        <h2 className="mt-1 font-display text-xl font-semibold text-imarah-deep">{title}</h2>
                        {showSub ? <p className="text-sm text-imarah-muted">{m.nameEn}</p> : null}
                      </div>
                      {m.distanceKm != null ? (
                        <span className="shrink-0 rounded-full bg-imarah-light px-2 py-1 text-xs font-medium text-imarah-primary">
                          ≈ {m.distanceKm.toFixed(1)} {t("dirKm")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-imarah-muted">
                      {m.addressLine1}, {m.postcode} · {pickLocaleText(lang, m.district.nameBm, m.district.nameEn)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {m.khairatAvailable ? (
                        <span className="rounded bg-imarah-goldlight/50 px-2 py-0.5 text-imarah-deep">Khairat</span>
                      ) : null}
                      {m.okuAccess ? <span className="rounded bg-imarah-light px-2 py-0.5">OKU</span> : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )
      )}

      {showEmptyBanner ? (
        <div className="mt-10 rounded-xl border border-dashed border-imarah-border bg-imarah-panel/40 px-4 py-8 text-center text-imarah-muted">
          <p>{t("emptyStateList")}</p>
          <p className="mt-2 text-sm">{t("dirEmpty")}</p>
        </div>
      ) : null}
    </div>
  );
}
