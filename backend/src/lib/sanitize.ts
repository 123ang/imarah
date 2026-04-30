/** Strip null bytes and trim; truncate for safe DB/API storage. Does not encode HTML — use escaping at render time in web/mobile. */
export function sanitizePlainText(input: unknown, maxLen: number): string {
  if (typeof input !== "string") return "";
  const NUL = "\0";
  let s = "";
  for (const ch of input) {
    if (ch !== NUL) s += ch;
  }
  return s.trim().slice(0, maxLen);
}
