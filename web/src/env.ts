/** API origin for production/staging when web and API are split. Dev: leave empty (Vite proxy `/api`). */
export function getApiBase(): string {
  const v = import.meta.env.VITE_API_BASE as string | undefined;
  return typeof v === "string" ? v.trim().replace(/\/$/, "") : "";
}

export function apiPath(path: string): string {
  const base = getApiBase();
  if (!base) return path;
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
}
