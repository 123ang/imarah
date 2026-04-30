import test from "node:test";
import assert from "node:assert/strict";
import { parsePrayerCsvRows } from "../src/services/prayer-import.service.ts";

test("parses documented 8-column prayer CSV", () => {
  const parsed = parsePrayerCsvRows(
    "zoneCode,date,subuh,syuruk,zohor,asar,maghrib,isyak\nWLY01,2026-04-30,05:55,07:11,13:18,16:30,19:25,20:35",
  );

  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].zoneCode, "WLY01");
  assert.equal(parsed.rows[0].stateCode, undefined);
});

test("parses safer 9-column prayer CSV with stateCode", () => {
  const parsed = parsePrayerCsvRows(
    "stateCode,zoneCode,date,subuh,syuruk,zohor,asar,maghrib,isyak\nMY-14,WLY01,2026-04-30,05:55,07:11,13:18,16:30,19:25,20:35",
  );

  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].stateCode, "MY-14");
});

test("rejects invalid prayer time", () => {
  const parsed = parsePrayerCsvRows(
    "zoneCode,date,subuh,syuruk,zohor,asar,maghrib,isyak\nWLY01,2026-04-30,25:55,07:11,13:18,16:30,19:25,20:35",
  );

  assert.equal(parsed.rows.length, 0);
  assert.match(parsed.errors.join("\n"), /subuh must be HH:mm/);
});
