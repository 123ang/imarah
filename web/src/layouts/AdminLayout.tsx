import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../hooks/useLang";

const lk = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-imarah-primary",
    isActive ? "bg-imarah-primary text-white" : "text-imarah-deep hover:bg-imarah-panel",
  ].join(" ");

export function AdminLayout() {
  const { t } = useLang();
  const { logout, user } = useAuth();
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[220px,minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-imarah-border bg-white p-3 shadow-sm">
          <p className="border-b px-2 pb-3 text-xs font-bold uppercase tracking-wider text-imarah-muted">{t("adminHubTitle")}</p>
          <nav className="mt-3 flex flex-col gap-1" aria-label={t("adminHubTitle")}>
            <NavLink className={lk} to="/admin/hub" end>
              {t("adminNavDashboard")}
            </NavLink>
          </nav>
          <div className="mt-6 border-t border-imarah-border pt-4 text-xs text-imarah-muted">
            {user?.email ? <p className="break-all">{user.email}</p> : null}
            <button
              type="button"
              className="btn-primary mt-3 w-full text-xs"
              onClick={() => void logout()}
            >
              {t("navLogout")}
            </button>
          </div>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
  );
}
