import { startTransition, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import { malaysiaTodayIso } from "../lib/date";
import type { DistrictRow, MosqueRow, StateRow } from "../types/api";

export function MasjidDirectory() {
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

  useEffect(() => {
    apiGet<{ items: StateRow[] }>("/api/meta/states")
      .then((d) => setStates(d.items))
      .catch(() => setError("Tidak dapat memuatkan senarai negeri. Pastikan API berjalan."));
  }, []);

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
    startTransition(() => {
      setLoading(true);
      setError(null);
    });
    const path = queryString ? `/api/mosques?${queryString}` : "/api/mosques";
    apiGet<{ items: MosqueRow[] }>(path)
      .then((d) => setItems(d.items))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [queryString]);

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Pelayar tidak menyokong lokasi GPS.");
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
          setError(e instanceof Error ? e.message : "Ralat");
        } finally {
          setLoading(false);
        }
      },
      () => setError("Kebenaran lokasi diperlukan untuk carian berhampiran."),
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="border-b border-imarah-border pb-8">
        <h1 className="font-display text-4xl font-semibold text-imarah-deep sm:text-5xl">
          Direktori Masjid &amp; Surau
        </h1>
        <p className="mt-3 max-w-2xl text-imarah-muted">
          <span className="font-medium text-imarah-ink">Directory</span> — data daripada pangkalan
          IMARAH. Hanya masjid <strong>aktif</strong> dipaparkan.
        </p>
      </header>

      <div className="mt-8 grid gap-4 rounded-2xl border border-imarah-border bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="field-label">
            <span>Carian / Search</span>
            <input
              className="field-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nama masjid…"
            />
          </label>
          <label className="field-label">
            <span>Negeri / State</span>
            <select className="field-control" value={stateId} onChange={(e) => setStateId(e.target.value)}>
              <option value="">Semua</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameBm}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            <span>Daerah / District</span>
            <select
              className="field-control"
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              disabled={!stateId}
            >
              <option value="">Semua</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameBm}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            <span>Jenis / Type</span>
            <select className="field-control" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="">Semua</option>
              <option value="MASJID">Masjid</option>
              <option value="SURAU">Surau</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-imarah-ink">
            <input type="checkbox" checked={khairat === true} onChange={() => setKhairat((v) => (v === true ? "" : true))} />
            Khairat
          </label>
          <label className="flex items-center gap-2 text-sm text-imarah-ink">
            <input type="checkbox" checked={oku === true} onChange={() => setOku((v) => (v === true ? "" : true))} />
            OKU
          </label>
          <button type="button" className="btn-primary text-sm" onClick={useMyLocation}>
            Terdekat / Near me
          </button>
          {nearbyLat && nearbyLng ? (
            <span className="text-xs text-imarah-muted">
              GPS: {nearbyLat}, {nearbyLng}
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <p className="mt-6 text-sm text-imarah-muted">
        Tarikh rujukan waktu solat: <strong>{malaysiaTodayIso()}</strong> (Malaysia / MYT; API menggunakan zon masjid)
      </p>

      {loading ? (
        <p className="mt-8 text-imarah-muted">Memuatkan…</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((m) => (
            <li key={m.id}>
              <Link
                to={`/masjid/${m.id}`}
                className="block rounded-2xl border border-imarah-border bg-white p-5 shadow-sm transition hover:border-imarah-primary/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-imarah-primary">
                      {m.type === "MASJID" ? "Masjid" : "Surau"}
                    </span>
                    <h2 className="mt-1 font-display text-xl font-semibold text-imarah-deep">{m.nameBm}</h2>
                    {m.nameEn ? <p className="text-sm text-imarah-muted">{m.nameEn}</p> : null}
                  </div>
                  {m.distanceKm != null ? (
                    <span className="shrink-0 rounded-full bg-imarah-light px-2 py-1 text-xs font-medium text-imarah-primary">
                      ≈ {m.distanceKm.toFixed(1)} km
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-imarah-muted">
                  {m.addressLine1}, {m.postcode} · {m.district.nameBm}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {m.khairatAvailable ? (
                    <span className="rounded bg-imarah-goldlight/50 px-2 py-0.5 text-imarah-deep">Khairat</span>
                  ) : null}
                  {m.okuAccess ? <span className="rounded bg-imarah-light px-2 py-0.5">OKU</span> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && items.length === 0 ? (
        <p className="mt-8 text-center text-imarah-muted">Tiada masjid dijumpai untuk tapisan ini.</p>
      ) : null}
    </div>
  );
}
