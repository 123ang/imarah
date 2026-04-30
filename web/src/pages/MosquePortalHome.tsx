import { Link, useParams } from "react-router-dom";
import { useLang } from "../hooks/useLang";

export function MosquePortalHome() {
  const { mosqueId } = useParams<{ mosqueId: string }>();
  const { t } = useLang();
  if (!mosqueId) return null;

  const cards = [
    {
      title: t("portalCardPublicTitle"),
      body: t("portalCardPublicBody"),
      to: `/masjid/${mosqueId}`,
    },
    {
      title: t("portalCardJamaatTitle"),
      body: t("portalCardJamaatBody"),
      to: `/pentadbir/masjid/${mosqueId}/jamaat`,
    },
    {
      title: t("portalCardSettingsTitle"),
      body: t("portalCardSettingsBody"),
      to: null as string | null,
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-imarah-border bg-white p-6 shadow-sm">
        <p className="text-imarah-muted">
          {t("mosqueIdLabel")}: <code className="rounded bg-imarah-panel px-1">{mosqueId}</code>. {t("detailModuleSoon")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <article key={c.title} className="flex flex-col rounded-2xl border border-imarah-border bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-imarah-deep">{c.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-imarah-muted">{c.body}</p>
            {c.to ? (
              <Link className="btn-primary mt-4 justify-center text-center text-sm" to={c.to}>
                {t("portalCardOpen")}
              </Link>
            ) : (
              <p className="mt-4 text-xs font-medium text-imarah-muted">{t("portalCardSoonLabel")} — {t("detailModuleSoon")}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
