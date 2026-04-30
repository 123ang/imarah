import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { config } from "../config.js";

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;

function keyBytes(): Buffer {
  const hex = config.fieldEncryptionKeyHex;
  if (!hex || hex.length < KEY_LEN * 2) throw new Error("FIELD_ENCRYPTION_KEY_HEX must be 64 hex chars (32 bytes)");
  return Buffer.from(hex.slice(0, KEY_LEN * 2), "hex");
}

/** Encrypted payload: iv(12).authTag.tag.ciphertext(base64-ish) compact representation */
export function encryptFieldUtf8(plain: string): string {
  const key = keyBytes();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function decryptFieldUtf8(payload: string): string {
  const key = keyBytes();
  const [ivs, tags, datas] = payload.split(".");
  if (!ivs || !tags || !datas) throw new Error("Invalid encrypted payload");
  const iv = Buffer.from(ivs, "base64url");
  const tag = Buffer.from(tags, "base64url");
  const data = Buffer.from(datas, "base64url");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** One-way fingerprint for lookups without storing plaintext (e.g. dedupe warnings). Not for decryption. */
export function fingerprintIcNormalized(icDigits: string): string {
  const norm = icDigits.replace(/\D/g, "");
  return createHash("sha256").update(norm).digest("hex");
}
