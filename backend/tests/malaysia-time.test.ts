import test from "node:test";
import assert from "node:assert/strict";
import { malaysiaPrayerInstant, prayerDateForDb } from "../src/lib/malaysia-time.ts";
import { nextPrayerCountdown } from "../src/services/prayer.service.ts";

test("stores date-only prayer records consistently at UTC noon", () => {
  assert.equal(prayerDateForDb("2026-04-30").toISOString(), "2026-04-30T12:00:00.000Z");
});

test("converts Malaysia prayer time to the correct UTC instant", () => {
  assert.equal(malaysiaPrayerInstant("2026-04-30", "05:55").toISOString(), "2026-04-29T21:55:00.000Z");
});

test("next prayer countdown uses Malaysia local prayer times", () => {
  const result = nextPrayerCountdown(
    { subuh: "05:55", syuruk: "07:11", zohor: "13:18", asar: "16:30", maghrib: "19:25", isyak: "20:35" },
    "2026-04-30",
    new Date("2026-04-30T04:00:00.000Z"), // 12:00 MYT
  );

  assert.equal(result.next, "zohor");
  assert.equal(result.minutesRemaining, 78);
});
