import { Link, Outlet } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../hooks/useLang";

export function AuthorityLayout() {
  const { t } = useLang();
  const { user, logout } = useAuth();
  return (
    <>
      <PageMeta title={`${t("authorityPortalTitle")} · IMARAH`} />
      <div className="mx-auto max-w-6xl border-b border-imarah-border/80 bg-imarah-panel/40 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-imarah-muted">
            <Link className="font-medium text-imarah-primary hover:underline" to="/">
              {t("navHome")}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-imarah-deep">{t("authorityPortalTitle")}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            {user?.email ? <span className="text-imarah-muted">{user.email}</span> : null}
            <button type="button" className="rounded-lg border border-imarah-border bg-white px-3 py-1.5 text-xs font-semibold" onClick={() => void logout()}>
              {t("navLogout")}
            </button>
          </div>
        </div>
      </div>
      <Outlet />
    </>
  );
}
