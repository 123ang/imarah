import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../lib/api";
import { useLang } from "../hooks/useLang";

export function LoginPage() {
  const { bootstrapped, user, login } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (!bootstrapped) return <Spinner />;
  if (user) {
    const to = typeof (loc.state as { from?: string })?.from === "string" ? (loc.state as { from: string }).from : "/";
    return <Navigate to={to || "/"} replace />;
  }

  async function submit() {
    setErr(null);
    try {
      await login(email, password);
      nav(typeof (loc.state as { from?: string })?.from === "string" ? (loc.state as { from: string }).from || "/" : "/");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("errGeneric"));
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PageMeta title={t("loginTitle")} />
      <h1 className="font-display text-3xl font-semibold text-imarah-deep">{t("loginTitle")}</h1>
      <p className="mt-4 text-xs text-imarah-muted">{t("authSpaNote")}</p>
      <div className="mt-8 space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <label className="field-label">
          {t("email")}
          <input className="field-control" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="field-label">
          {t("password")}
          <input type="password" className="field-control" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {err ? <p className="text-sm text-red-700">{err}</p> : null}
        <button type="button" className="btn-primary w-full" onClick={submit}>
          {t("loginSubmit")}
        </button>
        <div className="flex flex-wrap justify-between gap-2 text-sm text-imarah-primary">
          <Link to="/forgot-password">{t("forgotTitle")}</Link>
          <span>
            {t("noAccount")}{" "}
            <Link to="/register">{t("registerLink")}</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { bootstrapped, user } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (!bootstrapped) return <Spinner />;
  if (user) return <Navigate to="/" replace />;

  async function submit() {
    setErr(null);
    const em = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setErr(t("registerEmailInvalid"));
      return;
    }
    if (fullName.trim().length < 2) {
      setErr(t("registerNameShort"));
      return;
    }
    if (password.length < 8) {
      setErr(t("registerPwShort"));
      return;
    }
    try {
      await apiPost("/api/auth/register", { email: em, password, fullName: fullName.trim() });
      nav("/login");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("errGeneric"));
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PageMeta title={t("registerTitle")} />
      <h1 className="font-display text-3xl">{t("registerTitle")}</h1>
      <div className="mt-8 space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <label className="field-label">
          {t("fullName")}
          <input className="field-control" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label className="field-label">
          {t("email")}
          <input className="field-control" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field-label">
          {t("password")}
          <input type="password" className="field-control" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {err ? <p className="text-sm text-red-700">{err}</p> : null}
        <button type="button" className="btn-primary w-full" onClick={submit}>
          {t("registerSubmit")}
        </button>
        <p className="text-sm">
          {t("hasAccount")} <Link to="/login">{t("loginLink")}</Link>
        </p>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    try {
      await apiPost("/api/auth/forgot-password", { email });
      setMsg(t("forgotOk"));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("errGeneric"));
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PageMeta title={t("forgotTitle")} />
      <h1 className="font-display text-3xl">{t("forgotTitle")}</h1>
      <p className="mt-2 text-sm text-imarah-muted">{t("forgotDesc")}</p>
      <label className="field-label mt-8">
        {t("email")}
        <input className="field-control" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button type="button" className="btn-primary mt-4" onClick={submit}>
        {t("sendReset")}
      </button>
      {msg ? <p className="mt-4 text-sm text-green-800">{msg}</p> : null}
    </div>
  );
}

export function ResetPasswordPage() {
  const { t } = useLang();
  const [qs] = useSearchParams();
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(qs.get("token") ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    try {
      await apiPost("/api/auth/reset-password", { token, password });
      setMsg(t("resetOk"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("errGeneric"));
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PageMeta title={t("resetTitle")} />
      <h1 className="font-display text-3xl">{t("resetTitle")}</h1>
      <p className="mt-2 text-sm">{t("resetDesc")}</p>
      <label className="field-label mt-6">
        {t("tokenReset")}
        <input className="field-control font-mono text-xs" value={token} onChange={(e) => setToken(e.target.value)} />
      </label>
      <label className="field-label mt-2">
        {t("newPassword")}
        <input type="password" className="field-control" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="button" className="btn-primary mt-4" onClick={submit}>
        {t("savePassword")}
      </button>
      {err ? <p className="mt-4 text-sm text-red-700">{err}</p> : null}
      {msg ? <p className="mt-4 text-sm text-green-800">{msg}</p> : null}
    </div>
  );
}

export function VerifyEmailPage() {
  const { t } = useLang();
  const [qs] = useSearchParams();
  const [token] = useState(qs.get("token") ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    try {
      await apiPost("/api/auth/verify-email", { token });
      setMsg(t("verifyOk"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("errGeneric"));
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PageMeta title={t("verifyTitle")} />
      <h1 className="font-display text-3xl">{t("verifyTitle")}</h1>
      <p className="mt-6 text-xs font-mono break-all">{token}</p>
      <button type="button" className="btn-primary mt-4" onClick={submit} disabled={!token}>
        {t("confirmVerify")}
      </button>
      {err ? <p className="mt-4 text-sm text-red-700">{err}</p> : null}
      {msg ? <p className="mt-4 text-sm text-green-800">{msg}</p> : null}
    </div>
  );
}

export function ProfilePage() {
  const { user, logout, refreshProfile } = useAuth();
  const { t } = useLang();
  if (!user) return <Navigate to="/login" replace />;
  async function sendVerify() {
    await apiPost("/api/auth/send-verification", {}, { auth: true });
    await refreshProfile();
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <PageMeta title={t("profileTitle")} />
      <h1 className="font-display text-3xl">{t("profileTitle")}</h1>
      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm text-sm leading-relaxed">
        <p>
          <strong>{user.fullName}</strong>
          <br />
          {user.email}
          <br />
          Roles: {user.roles.join(", ")}
        </p>
        <p className="mt-4 text-imarah-muted">{t("profileReadOnly")}</p>
        {!user.emailVerified ? (
          <button type="button" className="btn-primary mt-4 text-sm" onClick={sendVerify}>
            {t("sendVerifyMail")}
          </button>
        ) : (
          <p className="mt-4 text-green-700">{t("profileVerified")}</p>
        )}
        <button type="button" className="mt-8 rounded-lg border border-imarah-primary px-4 py-2 text-sm font-semibold" onClick={logout}>
          {t("navLogout")}
        </button>
      </div>
    </div>
  );
}
