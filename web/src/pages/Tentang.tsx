import { useLang } from "../hooks/useLang";

export function Tentang() {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-display text-4xl font-semibold text-imarah-deep sm:text-5xl">{t("aboutTitle")}</h1>
      <div className="mt-8 max-w-3xl space-y-4 text-base leading-relaxed text-imarah-muted sm:text-lg">
        <p>{t("aboutP1")}</p>
        <p>{t("aboutP2")}</p>
        <p>{t("aboutP3")}</p>
      </div>
      <section id="zakat" className="mt-14 max-w-3xl scroll-mt-24 rounded-2xl border border-imarah-border bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-imarah-deep">{t("aboutZakatTitle")}</h2>
        <p className="mt-4 text-base leading-relaxed text-imarah-muted sm:text-lg">{t("aboutZakatBody")}</p>
      </section>
    </div>
  );
}
