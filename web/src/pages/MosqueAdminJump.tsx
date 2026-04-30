import { startTransition, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Forbidden } from "../components/Forbidden";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../lib/api";
import { useLang } from "../hooks/useLang";
import type { MosqueRow } from "../types/api";

export function MosqueAdminJump() {
  const { user, canSuperAdmin } = useAuth();
  const { t } = useLang();
  const [target, setTarget] = useState<string | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      if (canSuperAdmin()) {
        const d = await apiGet<{ items: MosqueRow[] }>("/api/mosques").catch(() => ({ items: [] }));
        startTransition(() => setTarget(d.items[0]?.id));
      } else startTransition(() => setTarget(user?.mosqueIds[0]));
    })();
  }, [canSuperAdmin, user?.mosqueIds]);

  if (target === undefined) return <Spinner />;
  if (!target) return <Forbidden detail={t("mosque403")} />;
  return <Navigate replace to={`/pentadbir/masjid/${target}`} />;
}
