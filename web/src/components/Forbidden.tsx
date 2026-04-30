import { Link } from "react-router-dom";
import { PageMeta } from "./PageMeta";
import { useLang } from "../hooks/useLang";

export function Forbidden({ detail }: { detail?: string }) {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <PageMeta title={t("forbiddenTitle")} />
      <p className="font-display text-3xl font-semibold text-imarah-deep">{t("forbiddenTitle")}</p>
      <p className="mt-4 text-imarah-muted">{detail ?? t("forbidden403")}</p>
      <Link className="mt-8 inline-block text-imarah-primary underline" to="/">
        {t("navHome")}
      </Link>
    </div>
  );
}
