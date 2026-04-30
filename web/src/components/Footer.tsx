import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-imarah-border bg-imarah-deep text-imarah-light">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-display text-xl font-semibold text-imarah-goldlight">IMARAH</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-imarah-light/85">
              Membantu masjid, surau, dan pihak berkuasa agama negeri berkhidmat dengan lebih teratur —
              bermula daripada data dan transparensi yang jelas.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-imarah-gold">
              Fokus Malaysia
            </p>
            <ul className="mt-3 space-y-2 text-sm text-imarah-light/85">
              <li>Bahasa Melayu &amp; English</li>
              <li>Sempadan negeri &amp; kariah</li>
              <li>Waktu solat melalui storan IMARAH (bukan API langsung pada MVP)</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-imarah-gold">
              Nota pembangun
            </p>
            <p className="mt-3 text-sm leading-relaxed text-imarah-light/85">
              Paparan ini ialah landasan awal mengikut{" "}
              <code className="rounded bg-black/20 px-1 py-0.5 text-xs">IMARAH_MVP_TODO.md</code>.
              Modul log masuk pentadbir dan API akan disambung kemudian.
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-imarah-light/70">
          <Link to="/admin/import" className="underline decoration-imarah-gold/60 hover:text-imarah-goldlight">
            Pentadbir: import waktu solat (CSV)
          </Link>
        </p>
        <p className="mt-4 border-t border-white/10 pt-6 text-center text-xs text-imarah-light/60">
          © {new Date().getFullYear()} IMARAH — Dibina untuk komuniti Islam di Malaysia.
        </p>
      </div>
    </footer>
  );
}
