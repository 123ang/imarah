import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { Forbidden } from "../components/Forbidden";
import { PageMeta } from "../components/PageMeta";
import { canEditMosque, useAuth } from "../context/AuthContext";
import { useLang } from "../hooks/useLang";

const link = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-imarah-primary text-white" : "text-imarah-deep hover:bg-white/70",
  ].join(" ");

export function MosqueAdminLayout() {
  const { mosqueId } = useParams<{ mosqueId: string }>();
  const { user, logout } = useAuth();
  const { t } = useLang();
  if (!mosqueId) return null;
  if (!canEditMosque(user, mosqueId)) return <Forbidden detail={t("mosque403")} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageMeta title={`${t("mosquePortalTitle")} · IMARAH`} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-imarah-border pb-4">
        <nav aria-label={t("mosquePortalTitle")} className="text-sm text-imarah-muted">
          <Link to="/" className="hover:text-imarah-primary">
            {t("navHome")}
          </Link>
          <span className="mx-2 text-imarah-border" aria-hidden>
            /
          </span>
          <Link to="/pentadbir/masjid" className="hover:text-imarah-primary">
            {t("mosquePortalTitle")}
          </Link>
          <span className="mx-2 text-imarah-border" aria-hidden>
            /
          </span>
          <span className="font-mono text-imarah-ink">{mosqueId}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {user?.email ? <span className="text-imarah-muted">{user.email}</span> : null}
          <button
            type="button"
            className="rounded-lg border border-imarah-border bg-white px-3 py-1.5 font-semibold"
            onClick={() => void logout()}
          >
            {t("navLogout")}
          </button>
        </div>
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold text-imarah-deep">{t("mosquePortalTitle")}</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav className="flex flex-col gap-1 rounded-2xl border border-imarah-border bg-white p-3 text-sm shadow-sm" aria-label={t("navMosquePortal")}>
          <NavLink className={link} to={`/pentadbir/masjid/${mosqueId}`} end>
            {t("mosqueDash")}
          </NavLink>
          <NavLink className={link} to={`/pentadbir/masjid/${mosqueId}/jamaat`}>
            {t("mosqueJamaat")}
          </NavLink>
          <NavLink className={link} to={`/pentadbir/masjid/${mosqueId}/profil`}>
            {t("mosqueProfile")}
          </NavLink>
          <NavLink className={link} to={`/pentadbir/masjid/${mosqueId}/acara`}>
            {t("mosqueEvents")}
          </NavLink>
          <NavLink className={link} to={`/pentadbir/masjid/${mosqueId}/pengumuman`}>
            {t("mosqueAnnouncements")}
          </NavLink>
          <NavLink className={link} to={`/pentadbir/masjid/${mosqueId}/kemudahan`}>
            {t("mosqueFacilities")}
          </NavLink>
        </nav>
        <div className="min-h-[200px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
