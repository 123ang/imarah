import type { JakimSyncJobStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

/**
 * MVP stub: persists job state only. Replace with importer calling JAKIM when integration is licensed and approved.
 */
export async function enqueueJakimSyncStub(): Promise<{ jobId: string; status: JakimSyncJobStatus }> {
  const job = await prisma.jakimSyncJob.create({
    data: { status: "RUNNING" },
  });
  await prisma.jakimSyncJob.update({
    where: { id: job.id },
    data: {
      status: "SUCCESS",
      lastRunAt: new Date(),
      lastError: null,
    },
  });
  const done = await prisma.jakimSyncJob.findUniqueOrThrow({ where: { id: job.id } });
  return { jobId: done.id, status: done.status };
}
