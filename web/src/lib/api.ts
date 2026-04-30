import { apiPath } from "../env";

export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type TokenGetter = () => Promise<string | null>;
type RefreshFn = () => Promise<string | null>;

let accessTokenGetter: TokenGetter = async () => localStorage.getItem("imarah_access");
let tryRefresh: RefreshFn | null = null;

/** Wire session refresh from AuthProvider bootstrap. */
export function configureApiAuth(getAccess: TokenGetter, refresh?: RefreshFn): void {
  accessTokenGetter = getAccess;
  tryRefresh = refresh ?? null;
}

async function applyAuthHeader(headers: Headers): Promise<void> {
  const t = await accessTokenGetter();
  if (t) headers.set("Authorization", `Bearer ${t}`);
}

async function readErrorMessage(res: Response): Promise<string> {
  const err = await res.json().catch(() => ({}));
  return (err as { error?: string }).error || res.statusText || "Error";
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { auth?: boolean },
): Promise<T> {
  const { auth, headers: hIn, ...rest } = init ?? {};
  const headers = new Headers(hIn);
  headers.set("Accept", "application/json");
  if (auth) await applyAuthHeader(headers);

  const url = apiPath(path);
  let res = await fetch(url, { ...rest, headers });

  if (res.status === 401 && auth && tryRefresh) {
    const ok = await tryRefresh();
    if (ok) {
      const h2 = new Headers(hIn);
      h2.set("Accept", "application/json");
      await applyAuthHeader(h2);
      res = await fetch(url, { ...rest, headers: h2 });
    }
  }

  if (!res.ok) throw new ApiError(await readErrorMessage(res), res.status);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string, opts?: { auth?: boolean }): Promise<T> {
  return apiRequest<T>(path, { method: "GET", auth: opts?.auth });
}

export async function apiPost<T>(
  path: string,
  body: object,
  opts?: { auth?: boolean },
): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    auth: opts?.auth,
  });
}

export async function apiPatch<T>(
  path: string,
  body: object,
  opts?: { auth?: boolean },
): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    auth: opts?.auth,
  });
}
