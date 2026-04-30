import { prisma } from "./prisma.js";

export function logAudit(input: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: object;
  ip?: string | null;
}): void {
  void prisma.auditLog
    .create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadataJson: input.metadata ?? undefined,
        ipAddress: input.ip ?? null,
      },
    })
    .catch(() => {});
}
