import "dotenv/config";
import { createHash } from "node:crypto";

function envStr(name: string, devFallback?: string): string {
  const v = process.env[name];
  if (v) return v;
  if (devFallback !== undefined) return devFallback;
  throw new Error(`Missing env ${name}`);
}

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const databaseUrl = envStr(
  "DATABASE_URL",
  isProduction ? undefined : "postgresql://imarah:imarah_dev@127.0.0.1:55433/imarah",
);

// Prisma reads DATABASE_URL directly from process.env. Keep dev fallback useful without
// weakening production, where envStr above still fails fast if DATABASE_URL is missing.
process.env.DATABASE_URL ||= databaseUrl;

const jwtAccessSecret = envStr(
  "JWT_ACCESS_SECRET",
  isProduction ? undefined : "dev_only_change_me_access_32chars__________",
);
const jwtRefreshSecret = envStr(
  "JWT_REFRESH_SECRET",
  isProduction ? undefined : "dev_only_change_me_refresh_32chars________",
);

let fieldEncryptionKeyHex = process.env.FIELD_ENCRYPTION_KEY_HEX?.trim();
if (!fieldEncryptionKeyHex) {
  if (isProduction) throw new Error("Missing FIELD_ENCRYPTION_KEY_HEX");
  fieldEncryptionKeyHex = createHash("sha256").update(jwtAccessSecret).digest("hex");
}

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv,
  isProduction,
  databaseUrl,
  jwtAccessSecret,
  jwtRefreshSecret,
  fieldEncryptionKeyHex,
  accessTtlSec: 60 * 15,
  refreshTtlDays: 7,
  passwordResetTtlMin: Number(process.env.PASSWORD_RESET_TTL_MIN || 60),
  emailVerifyTtlHours: Number(process.env.EMAIL_VERIFY_TTL_HOURS || 48),
  uploadRoot: process.env.UPLOAD_ROOT || "./uploads",
};
