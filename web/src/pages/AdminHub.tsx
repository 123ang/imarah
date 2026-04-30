import { startTransition, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageMeta } from "../components/PageMeta";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { apiPost } from "../lib/api";
import { useLang } from "../hooks/useLang";

export function AdminHub() {
  const { t } = useLang();
  const [sp] = useSearchParams();
  const tab = useMemo(() => sp.get("tab") || "csv", [sp]);
  return (
    <div>
      <PageMeta title={`${t("adminHubTitle")} · IMARAH`} />
      <TabSwitcher tab={tab} />
      {tab === "csv" ? <CsvTab /> : null}
      {tab === "json" ? <JsonTab /> : null}
      {tab === "invite" ? <InviteTab /> : null}
      {tab === "jakim" ? <JakimTab /> : null}
    </div>
  );
}

function TabSwitcher({ tab }: { tab: string }) {
  const { t } = useLang();
  const [, setSearchParams] = useSearchParams();

  function go(next: string) {
    startTransition(() => setSearchParams({ tab: next }, { replace: true }));
  }

  const btn =
    "rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ";
  const active =
    btn + "bg-imarah-primary text-white outline-imarah-primary hover:bg-imarah-primaryhover";
  const inactive = btn + "bg-white text-imarah-deep outline-imarah-primary/40 hover:bg-imarah-panel";

  return (
    <div className="mb-10 flex flex-wrap gap-2">
      <button type="button" className={tab === "csv" ? active : inactive} onClick={() => go("csv")}>
        {t("tabCsv")}
      </button>
      <button type="button" className={tab === "json" ? active : inactive} onClick={() => go("json")}>
        {t("tabJson")}
      </button>
      <button type="button" className={tab === "invite" ? active : inactive} onClick={() => go("invite")}>
        {t("tabInvite")}
      </button>
      <button type="button" className={tab === "jakim" ? active : inactive} onClick={() => go("jakim")}>
        {t("tabJakim")}
      </button>
    </div>
  );
}

function CsvTab() {
  const { bootstrapped } = useAuth();
  const { t } = useLang();
  const { pushErr, pushInfo } = useToast();
  const [csv, setCsv] = useState(
    "stateCode,zoneCode,date,subuh,syuruk,zohor,asar,maghrib,isyak\nMY-14,WLY01,2026-04-30,05:55,07:11,13:18,16:30,19:25,20:35",
  );
  if (!bootstrapped) return <Spinner />;

  async function imp() {
    try {
      const out = await apiPost<{ imported: number; errors: string[] }>("/api/admin/prayer/import-csv", { csv }, {
        auth: true,
      });
      pushInfo(`CSV: ${out.imported} (${out.errors.length} err)`);
    } catch (e) {
      pushErr(String(e instanceof Error ? e.message : "err"));
    }
  }

  return (
    <section className="rounded-2xl border border-imarah-border bg-white p-6 shadow-sm">
      <h2 className="font-display text-xl font-semibold">{t("tabCsv")}</h2>
      <textarea className="field-control mt-4 min-h-[220px] font-mono text-sm" value={csv} onChange={(e) => setCsv(e.target.value)} />
      <button type="button" className="btn-primary mt-4" onClick={imp}>
        Import
      </button>
      <ShowDevHint />
    </section>
  );
}

function JsonTab() {
  const { bootstrapped } = useAuth();
  const { t } = useLang();
  const { pushErr, pushInfo } = useToast();
  const [jsonTxt, setJsonTxt] = useState(`{\n  "rows": []\n}`);
  if (!bootstrapped) return <Spinner />;

  async function imp() {
    try {
      const body = JSON.parse(jsonTxt) as unknown;
      const out = await apiPost<{ imported: number; errors: string[] }>("/api/admin/prayer/import-json", body as object, {
        auth: true,
      });
      pushInfo(`JSON: ${out.imported} (${out.errors.length} err)`);
    } catch (e) {
      pushErr(String(e instanceof Error ? e.message : "bad json"));
    }
  }

  return (
    <section className="rounded-2xl border border-imarah-border bg-white p-6 shadow-sm">
      <h2 className="font-display text-xl font-semibold">{t("tabJson")}</h2>
      <p className="mt-2 text-xs text-imarah-muted">{t("jsonHint")}</p>
      <textarea className="field-control mt-4 min-h-[240px] font-mono text-sm" value={jsonTxt} onChange={(e) => setJsonTxt(e.target.value)} />
      <button type="button" className="btn-primary mt-4" onClick={imp}>
        Import JSON
      </button>
      <ShowDevHint />
    </section>
  );
}

function InviteTab() {
  const { bootstrapped } = useAuth();
  const { t } = useLang();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [mosqueId, setMosqueId] = useState("seed-mosque-mn");
  const [password, setPassword] = useState("");
  if (!bootstrapped) return <Spinner />;

  async function send() {
    try {
      await apiPost("/api/admin/invite-mosque-admin", { email, fullName, mosqueId, password }, { auth: true });
      toast.pushInfo(t("inviteOk"));
    } catch (e) {
      toast.pushErr(String(e instanceof Error ? e.message : ""));
    }
  }

  return (
    <section className="rounded-2xl border border-imarah-border bg-white p-6 shadow-sm">
      <h2 className="font-display text-xl">{t("tabInvite")}</h2>
      <p className="mt-2 text-xs text-imarah-muted">{t("invitePassHint")}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          {t("inviteEmail")}
          <input className="field-control" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field-label">
          {t("inviteName")}
          <input className="field-control" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label className="field-label">
          {t("inviteMosqueId")}
          <input className="field-control" value={mosqueId} onChange={(e) => setMosqueId(e.target.value)} />
        </label>
        <label className="field-label">
          {t("invitePass")}
          <input className="field-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      </div>
      <button type="button" className="btn-primary mt-6" onClick={send}>
        {t("inviteSubmit")}
      </button>
      <ShowDevHint />
    </section>
  );
}

function JakimTab() {
  const { bootstrapped } = useAuth();
  const { t } = useLang();
  const toast = useToast();
  const [job, setJob] = useState<string | null>(null);
  if (!bootstrapped) return <Spinner />;

  async function run() {
    try {
      const out = await apiPost<{ jobId: string }>("/api/admin/jakim/sync", {}, { auth: true });
      setJob(out.jobId);
      toast.pushInfo(`Job ${out.jobId}`);
    } catch (e) {
      toast.pushErr(String(e instanceof Error ? e.message : ""));
    }
  }

  return (
    <section className="rounded-2xl border border-imarah-border bg-white p-6 shadow-sm">
      <h2 className="font-display text-xl">{t("tabJakim")}</h2>
      <p className="mt-2 text-sm text-imarah-muted">{t("jakimIdle")}</p>
      <button type="button" className="btn-primary mt-6" onClick={run}>
        {t("jakimRun")}
      </button>
      {job ? <p className="mt-4 font-mono text-xs">{job}</p> : null}
    </section>
  );
}

function ShowDevHint() {
  const { t } = useLang();
  return import.meta.env.DEV ? (
    <p className="mt-4 text-xs text-imarah-muted">
      {t("adminDevPw")} <code>Imarah2026!</code>
    </p>
  ) : null;
}
