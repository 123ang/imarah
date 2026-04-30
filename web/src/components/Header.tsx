import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../hooks/useLang";
import { LANG_LABELS, type Lang } from "../i18n/copy";

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-imarah-primary text-white shadow-sm"
      : "text-imarah-ink hover:bg-white/80 hover:text-imarah-primary",
  ].join(" ");

const LANG_CODES: Lang[] = ["ms", "en"];

export function Header() {
  const { lang, setLang, t } = useLang();
  const { bootstrapped, user, canSuperAdmin, canMosquePortal, canAuthorityPortal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-imarah-border/80 bg-imarah-light/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="group flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-imarah-primary text-imarah-goldlight shadow-inner"
            aria-hidden
          >
            <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M16 4l2.8 9.7L28 16l-9.2 2.3L16 28l-2.8-9.7L4 16l9.2-2.3L16 4z" />
            </svg>
          </span>
          <div className="text-left leading-tight">
            <span className="block font-display text-xl font-semibold tracking-wide text-imarah-deep sm:text-2xl">
              IMARAH
            </span>
            <span className="block text-xs text-imarah-muted sm:text-sm">{t("brandTagline")}</span>
          </div>
        </NavLink>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          <div
            className="flex items-center gap-0.5 rounded-lg border border-imarah-border bg-white/90 p-0.5 shadow-sm"
            role="group"
            aria-label={t("langAria")}
          >
            {LANG_CODES.map((code) => {
              const active = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  className={
                    active
                      ? "rounded-md bg-imarah-primary px-2.5 py-1 text-xs font-semibold text-white shadow-inner"
                      : "rounded-md px-2.5 py-1 text-xs font-medium text-imarah-muted transition hover:bg-white/80 hover:text-imarah-deep"
                  }
                  aria-current={active ? "true" : undefined}
                >
                  {LANG_LABELS[code]}
                </button>
              );
            })}
          </div>
          <nav
            className="flex flex-wrap items-center justify-end gap-1"
            aria-label={lang === "ms" ? "Utama" : "Primary"}
          >
            <NavLink to="/" className={navClass} end>
              {t("navHome")}
            </NavLink>
            <NavLink to="/masjid" className={navClass}>
              {t("navDirectory")}
            </NavLink>
            <NavLink to="/solat" className={navClass}>
              {t("navPrayer")}
            </NavLink>
            <NavLink to="/tentang" className={navClass}>
              {t("navAbout")}
            </NavLink>
            {!bootstrapped ? null : user ? (
              <>
                <NavLink to="/profile" className={navClass}>
                  {t("navProfile")}
                </NavLink>
                {canSuperAdmin() ? (
                  <NavLink to="/admin/hub" className={navClass}>
                    {t("navAdmin")}
                  </NavLink>
                ) : null}
                {canMosquePortal() ? (
                  <NavLink to="/pentadbir/masjid" className={navClass}>
                    {t("navMosquePortal")}
                  </NavLink>
                ) : null}
                {canAuthorityPortal() ? (
                  <NavLink to="/pentadbir/majilis" className={navClass}>
                    {t("navAuthorityPortal")}
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-sm font-medium text-imarah-muted hover:bg-white/80 hover:text-imarah-deep"
                  onClick={() => void logout()}
                >
                  {t("navLogout")}
                </button>
              </>
            ) : (
              <NavLink to="/login" className={navClass}>
                {t("navLogin")}
              </NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
