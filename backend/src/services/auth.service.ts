import { z } from "zod";
import { config } from "../config.js";
import { logAudit } from "../lib/audit.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { hashToken, newRefreshTokenValue, signAccessToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
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
