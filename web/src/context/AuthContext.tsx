/* eslint-disable react-refresh/only-export-components -- module exports AuthProvider + session helpers for routing */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiPath } from "../env";
import { apiGet, configureApiAuth } from "../lib/api";
import { isJwtExpiringSoon } from "../lib/jwt-client";
import type { LoginResponse, SessionUser } from "../types/session";

const ACCESS = "imarah_access";
const REFRESH = "imarah_refresh";

type AuthCtx = {
  bootstrapped: boolean;
  user: SessionUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (code: string) => boolean;
  canSuperAdmin: () => boolean;
  canMosquePortal: () => boolean;
  canAuthorityPortal: () => boolean;
};

const Ctx = createContext<AuthCtx | null>(null);

async function refreshTokens(): Promise<boolean> {
  const rawRefresh = localStorage.getItem(REFRESH);
  if (!rawRefresh) return false;
  try {
    const res = await fetch(apiPath("/api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken: rawRefresh }),
    });
    if (!res.ok) throw new Error("refresh failed");
    const out = (await res.json()) as LoginResponse;
    localStorage.setItem(ACCESS, out.accessToken);
    localStorage.setItem(REFRESH, out.refreshToken);
    return true;
  } catch {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const refreshLock = useRef<Promise<boolean> | null>(null);

  const loadMe = useCallback(async (): Promise<void> => {
    const tok = localStorage.getItem(ACCESS);
    if (!tok) {
      setUser(null);
      return;
    }
    try {
      const me = await apiGet<SessionUser>("/api/auth/me", { auth: true });
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  const ensureRefresh = useCallback(async () => {
    if (!refreshLock.current) {
      refreshLock.current = refreshTokens().finally(() => {
        refreshLock.current = null;
      });
    }
    return refreshLock.current;
  }, []);

  const safeGetAccess = useCallback(async () => {
    const tok = localStorage.getItem(ACCESS);
    if (tok && !isJwtExpiringSoon(tok, 45)) return tok;
    const ok = await ensureRefresh();
    return ok ? localStorage.getItem(ACCESS) : null;
  }, [ensureRefresh]);

  const authRetry = useCallback(async () => {
    await ensureRefresh();
    return localStorage.getItem(ACCESS);
  }, [ensureRefresh]);

  useEffect(() => {
    configureApiAuth(safeGetAccess, authRetry);
  }, [safeGetAccess, authRetry]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const tok = localStorage.getItem(ACCESS);
      if (!tok || isJwtExpiringSoon(tok, 60)) await ensureRefresh();
      await loadMe();
      if (alive) setBootstrapped(true);
    })();
    return () => {
      alive = false;
    };
  }, [ensureRefresh, loadMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(apiPath("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Login failed");
      const out = data as LoginResponse;
      localStorage.setItem(ACCESS, out.accessToken);
      localStorage.setItem(REFRESH, out.refreshToken);
      await loadMe();
    },
    [loadMe],
  );

  const logout = useCallback(async () => {
    const ref = localStorage.getItem(REFRESH);
    try {
      await fetch(apiPath("/api/auth/logout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: ref }),
      });
    } catch {
      /* offline */
    }
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (code: string) => {
      return user?.roles.includes(code) ?? false;
    },
    [user],
  );

  const canSuperAdmin = useCallback(() => hasRole("SUPER_ADMIN"), [hasRole]);
  const canMosquePortal = useCallback(
    () =>
      hasRole("SUPER_ADMIN") || (hasRole("MOSQUE_ADMIN") && (user?.mosqueIds?.length ?? 0) > 0),
    [hasRole, user?.mosqueIds?.length],
  );
  const canAuthorityPortal = useCallback(() => hasRole("AUTHORITY_OFFICER") || hasRole("SUPER_ADMIN"), [hasRole]);

  const value = useMemo<AuthCtx>(
    () => ({
      bootstrapped,
      user,
      login,
      logout,
      refreshProfile: loadMe,
      hasRole,
      canSuperAdmin,
      canMosquePortal,
      canAuthorityPortal,
    }),
    [
      bootstrapped,
      user,
      login,
      logout,
      loadMe,
      hasRole,
      canSuperAdmin,
      canMosquePortal,
      canAuthorityPortal,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** SUPER_ADMIN bypasses mosque scope checks; mosque admins must match `mosqueId`. */
export function canEditMosque(user: SessionUser | null, mosqueId: string): boolean {
  if (!user) return false;
  if (user.roles.includes("SUPER_ADMIN")) return true;
  return user.roles.includes("MOSQUE_ADMIN") && user.mosqueIds.includes(mosqueId);
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
