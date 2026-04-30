import { Link } from "react-router-dom";

export function Home() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-imarah-border bg-gradient-to-b from-white via-imarah-panel to-imarah-light">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,92,74,0.12),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <p className="font-display text-lg text-imarah-primary sm:text-xl">
            Assalamualaikum warahmatullahi wabarakatuh
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-imarah-deep sm:text-5xl lg:text-6xl">
            Pusat kecemerlangan urusan{" "}
            <span className="text-imarah-primary">masjid &amp; surau</span> di Malaysia
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-imarah-muted">
            <strong className="text-imarah-ink">IMARAH</strong> menyatukan pengguna awam, pentadbir
            masjid, dan pihak berkuasa agama negeri — dengan penekanan pada data Malaysia, bahasa
            tempatan, dan keselamatan maklumat.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/masjid"
              className="inline-flex items-center justify-center rounded-lg bg-imarah-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-imarah-primaryhover"
            >
              Layari direktori
            </Link>
            <Link
              to="/tentang"
              className="inline-flex items-center justify-center rounded-lg border-2 border-imarah-primary bg-white/80 px-6 py-3 text-sm font-semibold text-imarah-primary transition hover:bg-white"
            >
              Kenali visi IMARAH
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-center font-display text-3xl font-semibold text-imarah-deep sm:text-4xl">
          Tiga tonggak utama
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-imarah-muted">
          Reka bentuk bertema warna hijau emas — inspirasi alam dan seni Islam yang sopan, sesuai
          konteks Malaysia.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <article className="rounded-2xl border border-imarah-border bg-white p-6 shadow-sm">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-imarah-light text-imarah-primary"
              aria-hidden
            >
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L4 9v12h4v-8h8v8h4V9l-8-6zm0 2.2L18 9.4V19h-1v-7H7v7H6V9.4l6-4.2z" />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-imarah-deep">Komuniti</h3>
            <p className="mt-2 text-sm leading-relaxed text-imarah-muted">
              Carian masjid &amp; surau, acara, dan khidmat yang diluluskan — dengan hormat kepada
              sempadan kariah dan negeri.
            </p>
          </article>
          <article className="rounded-2xl border border-imarah-border bg-white p-6 shadow-sm">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-imarah-light text-imarah-primary"
              aria-hidden
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-imarah-deep">Tadbir urus</h3>
            <p className="mt-2 text-sm leading-relaxed text-imarah-muted">
              Pentadbiran berperanan, log audit, dan kawalan capaian mengikut peranan — asas
              platform IMARAH.
            </p>
          </article>
          <article className="rounded-2xl border border-imarah-border bg-white p-6 shadow-sm">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-imarah-light text-imarah-primary"
              aria-hidden
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-imarah-deep">Waktu solat</h3>
            <p className="mt-2 text-sm leading-relaxed text-imarah-muted">
              Data waktu solat disimpan dalam pangkalan IMARAH (bukan bergantung API luar pada fasa
              MVP), bersedia untuk import dan jamaat per masjid.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
