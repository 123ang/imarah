import { useLang } from "../hooks/useLang";

function PlaceholderCard({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-imarah-border bg-white p-6 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-imarah-deep">{title}</h2>
      <p className="mt-2 text-sm text-imarah-muted">{body}</p>
    </section>
  );
}

export function MosquePortalProfilePage() {
  const { t } = useLang();
  return <PlaceholderCard title={t("mosqueProfile")} body={t("detailModuleSoon")} />;
}

export function MosquePortalEventsPage() {
  const { t } = useLang();
  return <PlaceholderCard title={t("mosqueEvents")} body={t("detailModuleSoon")} />;
}

export function MosquePortalAnnouncementsPage() {
  const { t } = useLang();
  return <PlaceholderCard title={t("mosqueAnnouncements")} body={t("detailModuleSoon")} />;
}

export function MosquePortalFacilitiesPage() {
  const { t } = useLang();
  return <PlaceholderCard title={t("mosqueFacilities")} body={t("detailModuleSoon")} />;
}
