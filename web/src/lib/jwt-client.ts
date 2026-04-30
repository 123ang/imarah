/** Decode JWT payload (no signature verification — client-side expiry hint only). */
export function decodeJwtPayload(token: string): { exp?: number; sub?: string; email?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;
    const pad = parts[1].length % 4;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/") + (pad ? "=".repeat(4 - pad) : "");
    const json = atob(b64);
    return JSON.parse(json) as { exp?: number; sub?: string; email?: string };
  } catch {
    return null;
  }
}

/** Seconds until expiry from `exp` claim; negative if already expired. */
export function secondsUntilJwtExpiry(token: string, nowSec = Math.floor(Date.now() / 1000)): number | null {
  const p = decodeJwtPayload(token);
  if (typeof p?.exp !== "number") return null;
  return p.exp - nowSec;
}

export function isJwtExpiringSoon(token: string | null | undefined, bufferSec: number): boolean {
  if (!token) return true;
  const s = secondsUntilJwtExpiry(token);
  if (s === null) return true;
  return s < bufferSec;
}
