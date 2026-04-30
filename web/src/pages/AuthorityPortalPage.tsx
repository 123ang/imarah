import { useLang } from "../hooks/useLang";

export function AuthorityPortalPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl">{t("authorityPortalTitle")}</h1>
      <p className="mt-6 text-lg leading-relaxed text-imarah-muted">{t("authorityIntro")}</p>
      <section className="mt-12 rounded-xl border border-dashed border-imarah-border bg-white/60 p-6 text-sm text-imarah-muted">
        <p className="font-semibold text-imarah-deep">{t("detailFutureEvents")}</p>
        <p className="mt-2">{t("detailModuleSoon")}</p>
        <p className="mt-6 font-semibold text-imarah-deep">{t("detailFutureNews")}</p>
        <p className="mt-2">{t("detailModuleSoon")}</p>
      </section>
      <aside className="mt-16 rounded-xl bg-imarah-panel px-6 py-4 text-xs text-imarah-muted">
        <p className="font-semibold text-imarah-deep">{t("smokeTitle")}</p>
        <p className="mt-2">{t("smokeBody")}</p>
      </aside>
    </div>
  );
}
