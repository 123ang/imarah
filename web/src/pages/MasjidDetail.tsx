import { startTransition, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { malaysiaTodayIso } from "../lib/date";
import type { MosqueRow, PrayerMosqueResponse } from "../types/api";

function mapsUrl(lat: string, lng: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
}

function mapsAppleUrl(lat: string, lng: string): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}`;
}

export function MasjidDetail() {
  const { id } = useParams();
  const [mosque, setMosque] = useState<MosqueRow | null>(null);
  const [prayer, setPrayer] = useState<PrayerMosqueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    startTransition(() => setError(null));
    apiGet<MosqueRow>(`/api/mosques/${id}`)
      .then(setMosque)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const d = malaysiaTodayIso();
    apiGet<PrayerMosqueResponse>(`/api/mosques/${id}/prayer-times?date=${d}`)
      .then(setPrayer)
      .catch(() => setPrayer(null));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>
        <Link to="/masjid" className="mt-6 inline-block text-imarah-primary underline">
          ← Kembali ke direktori
        </Link>
      </div>
    );
  }

  if (!mosque) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-imarah-muted">Memuatkan…</p>
      </div>
    );
  }

  const lat = mosque.latitude ? String(mosque.latitude) : "";
  const lng = mosque.longitude ? String(mosque.longitude) : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="text-sm text-imarah-muted">
        <Link to="/masjid" className="hover:text-imarah-primary">
          Direktori
        </Link>
        <span className="mx-2">/</span>
        <span className="text-imarah-ink">{mosque.nameBm}</span>
      </nav>

      <header className="mt-4 border-b border-imarah-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-imarah-primary">
          {mosque.type === "MASJID" ? "Masjid" : "Surau"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-imarah-deep sm:text-5xl">{mosque.nameBm}</h1>
        {mosque.nameEn ? <p className="mt-2 text-lg text-imarah-muted">{mosque.nameEn}</p> : null}
        <p className="mt-4 text-imarah-muted">
          {mosque.addressLine1}, {mosque.postcode}, {mosque.district.nameBm}, {mosque.state.nameBm}
        </p>
        {lat && lng ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={mapsUrl(lat, lng)}
              target="_blank"
              rel="noreferrer"
              className="btn-primary inline-flex text-sm"
            >
              Google Maps
            </a>
            <a
              href={mapsAppleUrl(lat, lng)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg border-2 border-imarah-primary bg-white px-4 py-2 text-sm font-semibold text-imarah-primary"
            >
              Apple Maps
            </a>
          </div>
        ) : (
          <p className="mt-4 text-sm text-imarah-muted">Koordinat GPS belum disimpan untuk masjid ini.</p>
        )}
      </header>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-imarah-deep">Waktu solat (data IMARAH)</h2>
        <p className="mt-1 text-sm text-imarah-muted">
          Prayer times (stored) · {malaysiaTodayIso()} MYT · Official vs jamaat where configured
        </p>
        {!prayer?.official ? (
          <p className="mt-4 rounded-lg border border-imarah-border bg-imarah-panel p-4 text-sm text-imarah-muted">
            Tiada rekod waktu solat untuk zon tarikh ini, atau masjid belum dihubungkan dengan zon waktu solat.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-imarah-border bg-white shadow-sm">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="bg-imarah-deep text-imarah-light">
                <tr>
                  <th className="px-4 py-3 font-medium">Waktu</th>
                  <th className="px-4 py-3 font-medium">Azan / Official</th>
                  <th className="px-4 py-3 font-medium">Jamaat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-imarah-border">
                {(
                  [
                    ["Subuh", prayer.official.subuh, prayer.jamaat?.subuh],
                    ["Syuruk", prayer.official.syuruk, prayer.jamaat?.syuruk],
                    ["Zohor", prayer.official.zohor, prayer.jamaat?.zohor],
                    ["Asar", prayer.official.asar, prayer.jamaat?.asar],
                    ["Maghrib", prayer.official.maghrib, prayer.jamaat?.maghrib],
                    ["Isyak", prayer.official.isyak, prayer.jamaat?.isyak],
                  ] as const
                ).map(([label, o, j]) => (
                  <tr key={label}>
                    <td className="px-4 py-2 font-medium text-imarah-deep">{label}</td>
                    <td className="px-4 py-2 font-mono text-imarah-ink">{o}</td>
                    <td className="px-4 py-2 font-mono text-imarah-muted">{j || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prayer.next?.next ? (
              <p className="border-t border-imarah-border px-4 py-3 text-sm text-imarah-muted">
                Next: <strong className="text-imarah-ink">{prayer.next.next}</strong>
                {prayer.next.minutesRemaining != null
                  ? ` · ≈ ${prayer.next.minutesRemaining} min`
                  : ""}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-imarah-border bg-white p-4">
          <h3 className="font-semibold text-imarah-deep">Kemudahan</h3>
          <ul className="mt-2 list-inside list-disc text-sm text-imarah-muted">
            {(mosque.facilitiesJson ?? []).length ? (
              mosque.facilitiesJson!.map((f) => <li key={f}>{f}</li>)
            ) : (
              <li>Tiada senarai tersimpan</li>
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-imarah-border bg-white p-4">
          <h3 className="font-semibold text-imarah-deep">Hubungan</h3>
          <p className="mt-2 text-sm text-imarah-muted">
            {mosque.phone ? <>Telefon: {mosque.phone}<br /></> : null}
            {mosque.websiteUrl ? (
              <a href={mosque.websiteUrl} className="text-imarah-primary underline" target="_blank" rel="noreferrer">
                Laman web
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
