import { parseIsoDateParts, parsePrayerTimeParts, prayerDateForDb } from "../lib/malaysia-time.js";
import { prisma } from "../lib/prisma.js";

const BASE_HEADER = ["zonecode", "date", "subuh", "syuruk", "zohor", "asar", "maghrib", "isyak"] as const;
const STATE_HEADER = ["statecode", ...BASE_HEADER] as const;

type PrayerCsvRow = {
  stateCode?: string;
  zoneCode: string;
  dateStr: string;
  subuh: string;
  syuruk: string;
  zohor: string;
  asar: string;
  maghrib: string;
  isyak: string;
};

function splitCsvLine(line: string): string[] {
  // MVP parser: supports simple comma-separated files. For quoted CSV/Excel, add a real parser later.
  return line.split(",").map((c) => c.trim());
}

function normaliseHeader(parts: string[]): string[] {
  return parts.map((p) => p.trim().toLowerCase().replace(/[ _-]/g, ""));
}

function sameHeader(parts: string[], expected: readonly string[]): boolean {
  return parts.length === expected.length && expected.every((h, i) => parts[i] === h);
}

export function parsePrayerCsvRows(csv: string): { rows: PrayerCsvRow[]; errors: string[]; hasHeader: boolean } {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const errors: string[] = [];
  const rows: PrayerCsvRow[] = [];
  if (!lines.length) return { rows, errors: ["Empty CSV"], hasHeader: false };

  const firstParts = splitCsvLine(lines[0]);
  const header = normaliseHeader(firstParts);
  const hasBaseHeader = sameHeader(header, BASE_HEADER);
  const hasStateHeader = sameHeader(header, STATE_HEADER);
  const looksLikeHeader = header.includes("zonecode") || header.includes("date") || header.includes("statecode");

  if (looksLikeHeader && !hasBaseHeader && !hasStateHeader) {
    return {
      rows,
      errors: [
        `Invalid header. Expected: ${BASE_HEADER.join(",")} or ${STATE_HEADER.join(",")}`,
      ],
      hasHeader: true,
    };
  }

  const startIdx = hasBaseHeader || hasStateHeader ? 1 : 0;
  const withStateCode = hasStateHeader || (!looksLikeHeader && firstParts.length === 9);

  for (let i = startIdx; i < lines.length; i++) {
    const parts = splitCsvLine(lines[i]);
    const expectedCols = withStateCode ? 9 : 8;
    if (parts.length !== expectedCols) {
      errors.push(`Line ${i + 1}: expected ${expectedCols} columns`);
      continue;
    }

    const stateCode = withStateCode ? parts[0] : undefined;
    const offset = withStateCode ? 1 : 0;
    const zoneCode = parts[offset]!;
    const dateStr = parts[offset + 1]!;
    const subuh = parts[offset + 2]!;
    const syuruk = parts[offset + 3]!;
    const zohor = parts[offset + 4]!;
    const asar = parts[offset + 5]!;
    const maghrib = parts[offset + 6]!;
    const isyak = parts[offset + 7]!;

    try {
      parseIsoDateParts(dateStr);
      for (const [label, value] of Object.entries({ subuh, syuruk, zohor, asar, maghrib, isyak })) {
        try {
          parsePrayerTimeParts(value);
        } catch {
          throw new Error(`${label} must be HH:mm`);
        }
      }
      rows.push({ stateCode, zoneCode, dateStr, subuh, syuruk, zohor, asar, maghrib, isyak });
    } catch (e) {
      errors.push(`Line ${i + 1}: ${e instanceof Error ? e.message : "invalid row"}`);
    }
  }

  return { rows, errors, hasHeader: hasBaseHeader || hasStateHeader };
}

/**
 * CSV columns:
 * - zoneCode,date,subuh,syuruk,zohor,asar,maghrib,isyak
 * - optional safer form: stateCode,zoneCode,date,subuh,syuruk,zohor,asar,maghrib,isyak
 */
export async function importPrayerCsv(csv: string): Promise<{ imported: number; errors: string[] }> {
  const parsed = parsePrayerCsvRows(csv);
  const errors = [...parsed.errors];
  if (!parsed.rows.length && errors.length) return { imported: 0, errors };

  const batch = await prisma.importBatch.create({
    data: { type: "PRAYER_TIMES", status: "RUNNING", rowCount: 0 },
  });

  let imported = 0;

  for (const [idx, row] of parsed.rows.entries()) {
    const lineNo = idx + (parsed.hasHeader ? 2 : 1);
    try {
      const zones = await prisma.prayerZone.findMany({
        where: {
          zoneCode: row.zoneCode,
          isActive: true,
          ...(row.stateCode ? { state: { code: row.stateCode } } : {}),
        },
        include: { state: true },
      });
      if (!zones.length) {
        errors.push(`Line ${lineNo}: unknown zoneCode ${row.zoneCode}${row.stateCode ? ` for ${row.stateCode}` : ""}`);
        continue;
      }
      if (zones.length > 1) {
        errors.push(`Line ${lineNo}: ambiguous zoneCode ${row.zoneCode}; include stateCode column`);
        continue;
      }
      const zone = zones[0];
      const date = prayerDateForDb(row.dateStr);
      await prisma.prayerTime.upsert({
        where: { zoneId_date: { zoneId: zone.id, date } },
        create: {
          zoneId: zone.id,
          date,
          subuh: row.subuh,
          syuruk: row.syuruk,
          zohor: row.zohor,
          asar: row.asar,
          maghrib: row.maghrib,
          isyak: row.isyak,
          source: "IMPORTED",
          importBatchId: batch.id,
        },
        update: {
          subuh: row.subuh,
          syuruk: row.syuruk,
          zohor: row.zohor,
          asar: row.asar,
          maghrib: row.maghrib,
          isyak: row.isyak,
          source: "IMPORTED",
          importBatchId: batch.id,
        },
      });
      imported++;
    } catch (e) {
      errors.push(`Line ${lineNo}: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  await prisma.importBatch.update({
    where: { id: batch.id },
    data: {
      status: errors.length ? "COMPLETED_WITH_ERRORS" : "COMPLETED",
      rowCount: imported,
      errorReport: errors.length ? errors.slice(0, 500).join("\n") : null,
    },
  });

  return { imported, errors };
}
