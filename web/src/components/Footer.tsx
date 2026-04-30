import { Link } from "react-router-dom";
import { useLang } from "../hooks/useLang";

export function Footer() {
  const { t, ti } = useLang();
  const year = String(new Date().getFullYear());

  return (
    <footer className="border-t border-imarah-border bg-imarah-deep text-imarah-light">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-display text-xl font-semibold text-imarah-goldlight">IMARAH</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-imarah-light/85">{t("footerBlurb")}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-imarah-gold">
              {t("footerColumnFocus")}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-imarah-light/85">
              <li>{t("footerBulletLang")}</li>
              <li>{t("footerBulletBoundary")}</li>
              <li>{t("footerBulletPrayer")}</li>
              <li>
                <Link to="/tentang#zakat" className="rounded-sm underline decoration-imarah-gold/60 hover:text-imarah-goldlight">
                  {t("donationNoteTitle")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-imarah-gold">
              {t("footerColumnDev")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-imarah-light/85">{t("footerDevNote")}</p>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-imarah-light/70">
          <Link to="/admin/hub" className="underline decoration-imarah-gold/60 hover:text-imarah-goldlight">
            {t("footerAdminHub")}
          </Link>
        </p>
        <p className="mt-4 border-t border-white/10 pt-6 text-center text-xs text-imarah-light/60">
          {ti("footerCopyright", { year })}
        </p>
      </div>
    </footer>
  );
}
