import { z } from "zod";
import { config } from "../config.js";
import { logAudit } from "../lib/audit.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { hashToken, newRefreshTokenValue, signAccessToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { sanitizePlainText } from "../lib/sanitize.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).transform((s) => sanitizePlainText(s, 120)),
  languagePref: z.enum(["ms", "en"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerUser(body: unknown) {
  const data = registerSchema.parse(body);
  const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (exists) throw new Error("E-mel sudah didaftarkan");
  const passwordHash = await hashPassword(data.password);
  const role = await prisma.role.findUnique({ where: { code: "REGISTERED_USER" } });
  if (!role) throw new Error("Peranan tidak dikonfigurasi — jalankan seed");
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      languagePref: data.languagePref ?? "ms",
      roles: { create: [{ roleId: role.id }] },
    },
  });
  return { id: user.id, email: user.email, fullName: user.fullName };
}

export async function loginUser(body: unknown, ip?: string | null) {
  const data = loginSchema.parse(body);
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase(), deletedAt: null },
    include: { roles: { include: { role: true } } },
  });
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    logAudit({ action: "LOGIN_FAILED", entityType: "User", metadata: { email: data.email }, ip });
    throw new Error("E-mel atau kata laluan tidak sah");
  }
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const rawRefresh = newRefreshTokenValue();
  const expiresAt = new Date(Date.now() + config.refreshTtlDays * 86400_000);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawRefresh),
      expiresAt,
    },
  });
  logAudit({ userId: user.id, action: "LOGIN", entityType: "User", entityId: user.id, ip });
  return {
    accessToken,
    refreshToken: rawRefresh,
    expiresIn: config.accessTtlSec,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      languagePref: user.languagePref,
      roles: user.roles.map((r) => r.role.code),
    },
  };
}

export async function refreshSession(rawRefresh: string) {
  const tokenHash = hashToken(rawRefresh);
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!row || row.revokedAt || row.expiresAt < new Date()) throw new Error("Sesi tidak sah");
  const user = await prisma.user.findFirst({ where: { id: row.userId, deletedAt: null } });
  if (!user) throw new Error("Pengguna tidak dijumpai");
  await prisma.refreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });
  const newRaw = newRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(newRaw),
      expiresAt: new Date(Date.now() + config.refreshTtlDays * 86400_000),
    },
  });
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  return { accessToken, refreshToken: newRaw, expiresIn: config.accessTtlSec };
}

export async function logoutUser(rawRefresh: string | undefined) {
  if (!rawRefresh) return;
  const tokenHash = hashToken(rawRefresh);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({ token: z.string().min(20), password: z.string().min(8) });

export async function forgotPasswordRequest(body: unknown, ip?: string | null): Promise<{ ok: true }> {
  const data = forgotSchema.parse(body);
  const email = data.email.toLowerCase();
  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
  const ok = { ok: true as const };
  if (!user) {
    logAudit({ action: "PASSWORD_RESET_REQUEST_UNKNOWN", entityType: "User", metadata: { email }, ip });
    return ok;
  }
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  const raw = newRefreshTokenValue();
  const expiresAt = new Date(Date.now() + config.passwordResetTtlMin * 60_000);
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hashToken(raw), expiresAt },
  });
  logAudit({ userId: user.id, action: "PASSWORD_RESET_REQUESTED", entityType: "User", entityId: user.id, ip });
  if (!config.isProduction) {
    // Dev hint only — wire email/SMS in deployment.
    console.info(`[dev] password reset token for ${email}: ${raw}`);
  }
  return ok;
}

export async function resetPasswordWithToken(body: unknown, ip?: string | null) {
  const data = resetSchema.parse(body);
  const tokenHash = hashToken(data.token);
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.usedAt || row.expiresAt < new Date()) throw new Error("Pautan tidak sah atau telah luput");

  const passwordHash = await hashPassword(data.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: row.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  logAudit({ userId: row.userId, action: "PASSWORD_RESET_COMPLETED", entityType: "User", entityId: row.userId, ip });
  return { ok: true as const };
}

const verifyConfirmSchema = z.object({ token: z.string().min(20) });

export async function requestEmailVerification(userId: string, ip?: string | null): Promise<{ ok: true }> {
  const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
  if (!user) throw new Error("Pengguna tidak dijumpai");
  if (user.emailVerifiedAt) throw new Error("E-mel sudah disahkan");
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  const raw = newRefreshTokenValue();
  const expiresAt = new Date(Date.now() + config.emailVerifyTtlHours * 3600_000);
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash: hashToken(raw), expiresAt },
  });
  logAudit({ userId, action: "EMAIL_VERIFICATION_REQUESTED", entityType: "User", entityId: userId, ip });
  if (!config.isProduction) console.info(`[dev] verify email token for ${user.email}: ${raw}`);
  return { ok: true };
}

export async function verifyEmailWithToken(body: unknown, ip?: string | null) {
  const data = verifyConfirmSchema.parse(body);
  const tokenHash = hashToken(data.token);
  const row = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  if (!row || row.usedAt || row.expiresAt < new Date()) throw new Error("Pautan tidak sah atau telah luput");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
  ]);
  logAudit({ userId: row.userId, action: "EMAIL_VERIFIED", entityType: "User", entityId: row.userId, ip });
  return { ok: true as const };
}
