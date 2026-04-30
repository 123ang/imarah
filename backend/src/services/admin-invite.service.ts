import { z } from "zod";
import { logAudit } from "../lib/audit.js";
import { hashPassword } from "../lib/password.js";
import { sanitizePlainText } from "../lib/sanitize.js";
import { prisma } from "../lib/prisma.js";

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  mosqueId: z.string().min(1),
  password: z.string().min(12),
});

/** Create MOSQUE_ADMIN user scoped to a mosque (invite-style onboarding). Email delivery is BYO SMTP later. */
export async function inviteMosqueAdmin(body: unknown, invitedByUserId: string, ip?: string | null) {
  const data = inviteSchema.parse(body);
  const email = data.email.toLowerCase();
  const fullName = sanitizePlainText(data.fullName, 120);

  const mosque = await prisma.mosque.findFirst({ where: { id: data.mosqueId, deletedAt: null } });
  if (!mosque) throw new Error("Masjid tidak dijumpai");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("E-mel sudah didaftarkan");

  const role = await prisma.role.findUnique({ where: { code: "MOSQUE_ADMIN" } });
  if (!role) throw new Error("Peranan MOSQUE_ADMIN tidak dikonfigurasi — jalankan seed");

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      roles: { create: [{ roleId: role.id, mosqueId: mosque.id }] },
    },
  });

  logAudit({
    userId: invitedByUserId,
    action: "MOSQUE_ADMIN_INVITED",
    entityType: "User",
    entityId: user.id,
    metadata: { mosqueId: mosque.id, email },
    ip,
  });

  return { id: user.id, email: user.email, fullName: user.fullName, mosqueId: mosque.id };
}
