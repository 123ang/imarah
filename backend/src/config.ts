import "dotenv/config";

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

export const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv,
  isProduction,
  databaseUrl,
  jwtAccessSecret,
  jwtRefreshSecret,
  accessTtlSec: 60 * 15,
  refreshTtlDays: 7,
  uploadRoot: process.env.UPLOAD_ROOT || "./uploads",
};
