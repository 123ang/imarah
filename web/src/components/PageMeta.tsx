import { useEffect } from "react";

const SITE = "IMARAH";

function upsertNamedMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertPropertyMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function PageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    const fullTitle = title.includes(SITE) ? title : `${title} · ${SITE}`;
    document.title = fullTitle;
    if (description) {
      upsertNamedMeta("description", description);
      upsertPropertyMeta("og:description", description);
    }
    upsertPropertyMeta("og:title", fullTitle);
  }, [title, description]);
  return null;
}
