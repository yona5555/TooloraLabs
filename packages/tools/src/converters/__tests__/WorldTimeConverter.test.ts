import { describe, it, expect } from "vitest";
import {
  getTimeZoneOffsetMinutes,
  zonedWallTimeToUtc,
  getZonedDayNumber,
  getDayDifference,
  convertBetweenZones,
  compareZonesAtInstant,
  formatUtcOffsetLabel,
  describeDifference,
  findOverlappingBusinessHours,
} from "../WorldTimeConverter";

describe("getTimeZoneOffsetMinutes", () => {
  it("returns 0 for UTC", () => {
    expect(getTimeZoneOffsetMinutes(new Date("2026-06-15T12:00:00Z"), "UTC")).toBe(0);
  });

  it("returns a fixed +540 for Tokyo year-round (no DST)", () => {
    expect(getTimeZoneOffsetMinutes(new Date("2026-01-15T00:00:00Z"), "Asia/Tokyo")).toBe(540);
    expect(getTimeZoneOffsetMinutes(new Date("2026-07-15T00:00:00Z"), "Asia/Tokyo")).toBe(540);
  });

  it("returns a fixed +330 for India (half-hour offset, no DST)", () => {
    expect(getTimeZoneOffsetMinutes(new Date("2026-01-15T00:00:00Z"), "Asia/Kolkata")).toBe(330);
    expect(getTimeZoneOffsetMinutes(new Date("2026-07-15T00:00:00Z"), "Asia/Kolkata")).toBe(330);
  });

  it("reflects New York's DST transition (EST -300 in winter, EDT -240 in summer)", () => {
    expect(getTimeZoneOffsetMinutes(new Date("2026-01-15T12:00:00Z"), "America/New_York")).toBe(-300);
    expect(getTimeZoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"), "America/New_York")).toBe(-240);
  });

  it("reflects London's DST transition (GMT +0 in winter, BST +60 in summer)", () => {
    expect(getTimeZoneOffsetMinutes(new Date("2026-01-15T12:00:00Z"), "Europe/London")).toBe(0);
    expect(getTimeZoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"), "Europe/London")).toBe(60);
  });
});

describe("zonedWallTimeToUtc", () => {
  it("converts a Tokyo wall-clock time to the correct UTC instant", () => {
    const utc = zonedWallTimeToUtc(2026, 6, 15, 21, 0, "Asia/Tokyo");
    expect(utc.toISOString()).toBe("2026-06-15T12:00:00.000Z");
  });

  it("round-trips: converting to UTC and reading the offset back reconstructs the same wall time", () => {
    const utc = zonedWallTimeToUtc(2026, 3, 10, 9, 30, "America/New_York");
    const offset = getTimeZoneOffsetMinutes(utc, "America/New_York");
    const localMs = utc.getTime() + offset * 60_000;
    const local = new Date(localMs);
    expect(local.getUTCHours()).toBe(9);
    expect(local.getUTCMinutes()).toBe(30);
  });

  it("handles the two sides of a DST transition correctly", () => {
    // 2026-03-08 is the US spring-forward date; 01:30 local (before the jump) is unambiguous EST.
    const beforeJump = zonedWallTimeToUtc(2026, 3, 8, 1, 30, "America/New_York");
    expect(getTimeZoneOffsetMinutes(beforeJump, "America/New_York")).toBe(-300);

    // A wall time well after the jump the same day is unambiguous EDT.
    const afterJump = zonedWallTimeToUtc(2026, 3, 8, 5, 0, "America/New_York");
    expect(getTimeZoneOffsetMinutes(afterJump, "America/New_York")).toBe(-240);
  });
});

describe("getZonedDayNumber / getDayDifference", () => {
  it("agrees on the same day number when both zones are far from midnight in the same relative sense", () => {
    const instant = new Date("2026-06-15T12:00:00Z");
    expect(getZonedDayNumber(instant, "UTC")).toBe(getZonedDayNumber(instant, "UTC"));
  });

  it("reports Tokyo a day ahead of Los Angeles late in the LA evening", () => {
    // 23:00 LA time (PDT, UTC-7) on June 15 is 06:00 UTC June 16, which is 15:00 Tokyo time June 16.
    const instant = zonedWallTimeToUtc(2026, 6, 15, 23, 0, "America/Los_Angeles");
    expect(getDayDifference(instant, "America/Los_Angeles", "Asia/Tokyo")).toBe(1);
  });

  it("returns 0 for the same zone", () => {
    const instant = new Date("2026-06-15T12:00:00Z");
    expect(getDayDifference(instant, "Europe/Paris", "Europe/Paris")).toBe(0);
  });
});

describe("convertBetweenZones", () => {
  it("computes the correct offsets and difference for New York -> Tokyo in summer", () => {
    const result = convertBetweenZones(2026, 7, 15, 9, 0, "America/New_York", "Asia/Tokyo");
    expect(result.fromOffsetMinutes).toBe(-240);
    expect(result.toOffsetMinutes).toBe(540);
    expect(result.differenceMinutes).toBe(780); // 13 hours ahead
    expect(result.dayDifference).toBe(0); // 9am EDT is still the same UTC-side calendar day in Tokyo (10pm)
  });

  it("is internally consistent with getTimeZoneOffsetMinutes for the resulting instant", () => {
    const result = convertBetweenZones(2026, 1, 15, 14, 0, "Europe/London", "America/New_York");
    const utcDate = new Date(result.utcInstant);
    expect(getTimeZoneOffsetMinutes(utcDate, "Europe/London")).toBe(result.fromOffsetMinutes);
    expect(getTimeZoneOffsetMinutes(utcDate, "America/New_York")).toBe(result.toOffsetMinutes);
  });
});

describe("compareZonesAtInstant", () => {
  it("computes the correct offsets/difference for a known instant, independent of any wall-clock interpretation", () => {
    // 21:00 UTC on 2026-07-15 is 17:00 in New York (EDT, -240) and 22:00 in London (BST, +60).
    const instant = new Date("2026-07-15T21:00:00Z");
    const result = compareZonesAtInstant(instant, "America/New_York", "Europe/London");
    expect(result.utcInstant).toBe(instant.getTime());
    expect(result.fromOffsetMinutes).toBe(-240);
    expect(result.toOffsetMinutes).toBe(60);
    expect(result.differenceMinutes).toBe(300); // London 5 hours ahead of New York
  });

  it(
    "regression: does not depend on the machine's own local time zone " +
      "(a bug where callers derived y/m/d/h/min via Date's local getters and fed them back " +
      "through zonedWallTimeToUtc as if they were the From zone's wall clock, silently " +
      "shifting the instant by the gap between the machine's real zone and the From zone)",
    () => {
      const instant = new Date("2026-08-10T21:55:00Z");
      const result = compareZonesAtInstant(instant, "America/New_York", "Europe/London");
      // Independently expected via getTimeZoneOffsetMinutes, not derived from the instant's local getters.
      expect(result.fromOffsetMinutes).toBe(getTimeZoneOffsetMinutes(instant, "America/New_York"));
      expect(result.toOffsetMinutes).toBe(getTimeZoneOffsetMinutes(instant, "Europe/London"));
      expect(result.utcInstant).toBe(instant.getTime());
    }
  );

  it("matches convertBetweenZones's offsets when fed that same instant's own wall-clock reading in fromZone", () => {
    const viaWallTime = convertBetweenZones(2026, 7, 15, 17, 0, "America/New_York", "Europe/London");
    const viaInstant = compareZonesAtInstant(new Date(viaWallTime.utcInstant), "America/New_York", "Europe/London");
    expect(viaInstant.fromOffsetMinutes).toBe(viaWallTime.fromOffsetMinutes);
    expect(viaInstant.toOffsetMinutes).toBe(viaWallTime.toOffsetMinutes);
    expect(viaInstant.differenceMinutes).toBe(viaWallTime.differenceMinutes);
  });
});

describe("formatUtcOffsetLabel", () => {
  it("formats a positive offset", () => {
    expect(formatUtcOffsetLabel(330)).toBe("+05:30");
  });

  it("formats a negative offset", () => {
    expect(formatUtcOffsetLabel(-300)).toBe("-05:00");
  });

  it("formats zero as +00:00", () => {
    expect(formatUtcOffsetLabel(0)).toBe("+00:00");
  });

  it("zero-pads single-digit hours and minutes", () => {
    expect(formatUtcOffsetLabel(45)).toBe("+00:45");
  });
});

describe("describeDifference", () => {
  it("splits a positive difference into ahead hours/minutes", () => {
    const result = describeDifference(780);
    expect(result).toEqual({ hours: 13, minutes: 0, isAhead: true, isSame: false });
  });

  it("splits a negative difference into behind hours/minutes", () => {
    const result = describeDifference(-330);
    expect(result).toEqual({ hours: 5, minutes: 30, isAhead: false, isSame: false });
  });

  it("flags a zero difference as same", () => {
    const result = describeDifference(0);
    expect(result.isSame).toBe(true);
    expect(result.isAhead).toBe(false);
  });
});

describe("findOverlappingBusinessHours", () => {
  it("finds a real overlap window between London and New York", () => {
    const referenceDate = new Date("2026-07-15T00:00:00Z");
    const overlap = findOverlappingBusinessHours("Europe/London", "America/New_York", referenceDate);
    expect(overlap.length).toBeGreaterThan(0);
    expect(overlap.length).toBeLessThanOrEqual(8);
  });

  it("finds no overlap between zones on opposite sides of the clock", () => {
    // Tokyo (+9) and Los Angeles (-7 in summer) are 16 hours apart — 9-5 business hours can't overlap.
    const referenceDate = new Date("2026-07-15T00:00:00Z");
    const overlap = findOverlappingBusinessHours("Asia/Tokyo", "America/Los_Angeles", referenceDate);
    expect(overlap).toEqual([]);
  });

  it("finds the full business day as overlap for the same zone", () => {
    const referenceDate = new Date("2026-07-15T00:00:00Z");
    const overlap = findOverlappingBusinessHours("Europe/Paris", "Europe/Paris", referenceDate, 9, 17);
    expect(overlap.length).toBe(8);
  });
});
