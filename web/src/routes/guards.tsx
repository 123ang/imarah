import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Forbidden } from "../components/Forbidden";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../hooks/useLang";

export function RequireUser() {
  const { bootstrapped, user } = useAuth();
  const loc = useLocation();
  if (!bootstrapped) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}

export function RequireSuperAdmin() {
  const { bootstrapped, user, canSuperAdmin } = useAuth();
  const { t } = useLang();
  if (!bootstrapped) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!canSuperAdmin()) return <Forbidden detail={t("admin403")} />;
  return <Outlet />;
}

export function RequireMosquePortal() {
  const { bootstrapped, user, canMosquePortal } = useAuth();
  const { t } = useLang();
  if (!bootstrapped) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!canMosquePortal()) return <Forbidden detail={t("mosque403")} />;
  return <Outlet />;
}

export function RequireAuthorityPortal() {
  const { bootstrapped, user, canAuthorityPortal } = useAuth();
  const { t } = useLang();
  if (!bootstrapped) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!canAuthorityPortal()) return <Forbidden detail={t("forbidden403")} />;
  return <Outlet />;
}
