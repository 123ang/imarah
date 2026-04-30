import { useState } from "react";
import { apiPost } from "../lib/api";

export function AdminPrayerImport() {
  const [email, setEmail] = useState("admin@imarah.local");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("imarah_access") || "");
  const [csv, setCsv] = useState(
    "stateCode,zoneCode,date,subuh,syuruk,zohor,asar,maghrib,isyak\nMY-14,WLY01,2026-04-30,05:55,07:11,13:18,16:30,19:25,20:35",
  );
  const showSeedHint = import.meta.env.DEV;
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function login() {
    setErr(null);
    setMsg(null);
    try {
      const out = await apiPost<{ accessToken: string }>("/api/auth/login", { email, password });
      localStorage.setItem("imarah_access", out.accessToken);
      setToken(out.accessToken);
      setMsg("Log masuk berjaya.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Ralat");
    }
  }

  async function importCsv() {
    setErr(null);
    setMsg(null);
    const t = token || localStorage.getItem("imarah_access") || "";
    if (!t) {
      setErr("Sila log masuk sebagai SUPER_ADMIN.");
      return;
    }
    try {
      const out = await apiPost<{ imported: number; errors: string[] }>(
        "/api/admin/prayer/import-csv",
        { csv },
        t,
      );
      setMsg(`Import: ${out.imported} baris. Ralat: ${out.errors.length ? out.errors.join("; ") : "tiada"}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Ralat");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-semibold text-imarah-deep">Import waktu solat (CSV)</h1>
      <p className="mt-2 text-sm text-imarah-muted">
        SUPER_ADMIN sahaja. Gunakan akaun pentadbir yang telah disediakan untuk persekitaran ini.
        {showSeedHint ? (
          <span>
            {" "}Dev seed password: <code className="rounded bg-imarah-light px-1">Imarah2026!</code>
          </span>
        ) : null}
      </p>

      <div className="mt-8 space-y-4 rounded-xl border border-imarah-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-imarah-deep">Log masuk</h2>
        <label className="field-label">
          E-mel
          <input className="field-control" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field-label">
          Kata laluan
          <input
            type="password"
            className="field-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button type="button" className="btn-primary" onClick={login}>
          Log masuk
        </button>
      </div>

      <div className="mt-8 space-y-4 rounded-xl border border-imarah-border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-imarah-deep">CSV</h2>
        <textarea className="field-control min-h-[200px] font-mono text-sm" value={csv} onChange={(e) => setCsv(e.target.value)} />
        <button type="button" className="btn-primary" onClick={importCsv}>
          Import
        </button>
      </div>

      {msg ? <p className="mt-4 text-sm text-green-800">{msg}</p> : null}
      {err ? <p className="mt-4 text-sm text-red-700">{err}</p> : null}
    </div>
  );
}
