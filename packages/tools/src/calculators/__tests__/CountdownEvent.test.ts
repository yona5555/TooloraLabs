import { describe, expect, it } from "vitest";
import {
  buildCountdownIcs,
  countdownBreakdown,
  countdownDateInYear,
  countdownDaysLeft,
  countdownDstChangeBefore,
  countdownIcsFileName,
  countdownMilestones,
  countdownNextOccurrence,
  countdownPresets,
  countdownPreviousOccurrence,
  countdownProgress,
  countdownResolveTarget,
  icsEscapeText,
  icsFoldLine,
} from "../CountdownEvent";
import { gregorianToHijri, isHijriSupported } from "../DateTimeCore";

const NOW = Date.UTC(2026, 9, 17, 12, 0, 0); // 2026-10-17 12:00 UTC
const midnight = { hour: 0, minute: 0 };

describe("Hijri presets (Umm al-Qura)", () => {
  it("runtime supports the Umm al-Qura calendar", () => {
    expect(isHijriSupported()).toBe(true);
  });

  it("computes the next Ramadan, Eid al-Fitr, Eid al-Adha and Hijri New Year from the calendar", () => {
    const presets = countdownPresets(NOW, "Asia/Riyadh");
    const by = Object.fromEntries(presets.map((p) => [p.key, p]));
    expect(by.ramadan.date).toEqual({ year: 2027, month: 2, day: 8 });
    expect(by.ramadan.hijri).toEqual({ year: 1448, month: 9, day: 1 });
    expect(by.eidFitr.date).toEqual({ year: 2027, month: 3, day: 9 });
    expect(by.eidFitr.hijri).toEqual({ year: 1448, month: 10, day: 1 });
    expect(by.eidAdha.date).toEqual({ year: 2027, month: 5, day: 16 });
    expect(by.eidAdha.hijri).toEqual({ year: 1448, month: 12, day: 10 });
    expect(by.arafah.hijri).toEqual({ year: 1448, month: 12, day: 9 });
    expect(by.hijriNewYear.hijri).toEqual({ year: 1449, month: 1, day: 1 });
    expect(by.ramadan.moonSighting).toBe(true);
    expect(by.newYear.moonSighting).toBe(false);
  });

  it("Gregorian presets: New Year, end of month and Saudi National Day", () => {
    const by = Object.fromEntries(countdownPresets(NOW, "Asia/Riyadh").map((p) => [p.key, p]));
    expect(by.newYear.date).toEqual({ year: 2027, month: 1, day: 1 });
    expect(by.endOfMonth.date).toEqual({ year: 2026, month: 10, day: 31 });
    expect(by.endOfMonth.clock).toEqual({ hour: 23, minute: 59 });
    expect(by.endOfMonth.yearly).toBe(false);
    // Sep 23 2026 has passed on Oct 17, so it rolls to 2027.
    expect(by.saudiNationalDay.date).toEqual({ year: 2027, month: 9, day: 23 });
  });

  it("presets are sorted by date and all lie in the future", () => {
    const presets = countdownPresets(NOW, "Asia/Riyadh");
    for (let i = 1; i < presets.length; i++) {
      expect(Date.UTC(presets[i].date.year, presets[i].date.month - 1, presets[i].date.day)).toBeGreaterThanOrEqual(
        Date.UTC(presets[i - 1].date.year, presets[i - 1].date.month - 1, presets[i - 1].date.day),
      );
    }
    for (const p of presets) {
      expect(countdownResolveTarget(p.date, p.clock, "Asia/Riyadh").utcMs).toBeGreaterThan(NOW);
    }
  });

  it("rolls Ramadan to the following Hijri year once it has started", () => {
    // 1 Ramadan 1447 = 2026-02-18; on 2026-03-01 the next start is 1448.
    const now = Date.UTC(2026, 2, 1);
    const occ = countdownNextOccurrence({ calendar: "hijri", month: 9, day: 1 }, midnight, "Asia/Riyadh", now);
    expect(occ.year).toBe(1448);
    expect(gregorianToHijri(occ.date)).toEqual({ year: 1448, month: 9, day: 1 });
    const prev = countdownPreviousOccurrence({ calendar: "hijri", month: 9, day: 1 }, midnight, "Asia/Riyadh", now);
    expect(prev.date).toEqual({ year: 2026, month: 2, day: 18 });
  });

  it("clamps Hijri day 30 to 29 in a 29-day month", () => {
    const rule = { calendar: "hijri" as const, month: 9, day: 30 };
    for (const y of [1446, 1447, 1448]) {
      const r = countdownDateInYear(rule, y);
      expect(r).not.toBeNull();
      const h = gregorianToHijri(r!.date);
      expect(h.month).toBe(9);
      expect(h.day === 30 ? !r!.adjusted : r!.adjusted && h.day === 29).toBe(true);
    }
  });
});

describe("zone-aware target instant", () => {
  it("interprets the wall time in the event's zone (no DST: Riyadh UTC+3)", () => {
    const t = countdownResolveTarget({ year: 2027, month: 1, day: 1 }, midnight, "Asia/Riyadh");
    expect(t.utcMs).toBe(Date.UTC(2026, 11, 31, 21, 0));
    expect(t.offsetMinutes).toBe(180);
    expect(t.status).toBe("ok");
    expect(t.dst).toBe(false);
  });

  it("uses the summer offset after DST starts and the winter offset before", () => {
    const winter = countdownResolveTarget({ year: 2026, month: 3, day: 7 }, { hour: 12, minute: 0 }, "America/New_York");
    const summer = countdownResolveTarget({ year: 2026, month: 3, day: 9 }, { hour: 12, minute: 0 }, "America/New_York");
    expect(winter.utcMs).toBe(Date.UTC(2026, 2, 7, 17));
    expect(summer.utcMs).toBe(Date.UTC(2026, 2, 9, 16));
    expect(summer.dst).toBe(true);
    // Two days of wall time are 47 real hours across the spring-forward night.
    expect((summer.utcMs - winter.utcMs) / 3_600_000).toBe(47);
  });

  it("flags a wall time skipped by spring-forward as a gap (shifted forward)", () => {
    const t = countdownResolveTarget({ year: 2026, month: 3, day: 8 }, { hour: 2, minute: 30 }, "America/New_York");
    expect(t.status).toBe("gap");
    expect(t.utcMs).toBe(Date.UTC(2026, 2, 8, 7, 30)); // 03:30 EDT
  });

  it("flags a repeated wall time at fall-back as an overlap (earlier instant)", () => {
    const t = countdownResolveTarget({ year: 2026, month: 11, day: 1 }, { hour: 1, minute: 30 }, "America/New_York");
    expect(t.status).toBe("overlap");
    expect(t.utcMs).toBe(Date.UTC(2026, 10, 1, 5, 30)); // 01:30 EDT
  });

  it("reports the DST change between now and the target", () => {
    const tr = countdownDstChangeBefore("Europe/London", NOW, Date.UTC(2026, 11, 1));
    expect(tr).not.toBeNull();
    expect(tr!.utcMs).toBe(Date.UTC(2026, 9, 25, 1));
    expect(tr!.offsetBefore).toBe(60);
    expect(tr!.offsetAfter).toBe(0);
    expect(countdownDstChangeBefore("Asia/Riyadh", NOW, Date.UTC(2027, 5, 1))).toBeNull();
  });
});

describe("remaining time and business days", () => {
  it("breaks the difference into days, hours, minutes, seconds and weeks", () => {
    const b = countdownBreakdown(NOW + ((9 * 24 + 5) * 3600 + 6 * 60 + 7) * 1000, NOW);
    expect(b).toMatchObject({ isPast: false, days: 9, hours: 5, minutes: 6, seconds: 7, weeks: 1, weekDays: 2 });
    const past = countdownBreakdown(NOW - 90_000, NOW);
    expect(past).toMatchObject({ isPast: true, days: 0, hours: 0, minutes: 1, seconds: 30 });
  });

  it("counts business days left with a Fri–Sat or Sat–Sun weekend", () => {
    // Sat 2026-10-17 → Sat 2026-10-31: 14 days counted (17th … 30th).
    const event = { year: 2026, month: 10, day: 31 };
    const friSat = countdownDaysLeft(NOW, event, "Asia/Riyadh", "fri-sat");
    expect(friSat.calendarDays).toBe(14);
    expect(friSat.businessDays).toBe(10);
    expect(friSat.weekendDays).toBe(4);
    const satSun = countdownDaysLeft(NOW, event, "Asia/Riyadh", "sat-sun");
    expect(satSun.businessDays).toBe(10);
    expect(satSun.weekendDays).toBe(4);
    // Sun 2026-10-18 → Fri 2026-10-23: Sun–Thu are workdays under Fri–Sat, Mon–Thu under Sat–Sun.
    const sun = Date.UTC(2026, 9, 18, 9);
    expect(countdownDaysLeft(sun, { year: 2026, month: 10, day: 23 }, "Asia/Riyadh", "fri-sat").businessDays).toBe(5);
    expect(countdownDaysLeft(sun, { year: 2026, month: 10, day: 23 }, "Asia/Riyadh", "sat-sun").businessDays).toBe(4);
  });

  it("reads 'today' in the event's zone", () => {
    // 22:30 UTC on Oct 17 is already Oct 18 in Riyadh.
    const late = Date.UTC(2026, 9, 17, 22, 30);
    expect(countdownDaysLeft(late, { year: 2026, month: 10, day: 20 }, "Asia/Riyadh", "fri-sat").from).toEqual({ year: 2026, month: 10, day: 18 });
    expect(countdownDaysLeft(late, { year: 2026, month: 10, day: 20 }, "America/New_York", "sat-sun").from).toEqual({ year: 2026, month: 10, day: 17 });
  });

  it("returns zero days once the event day is today or past", () => {
    expect(countdownDaysLeft(NOW, { year: 2026, month: 10, day: 17 }, "UTC", "sat-sun").calendarDays).toBe(0);
    expect(countdownDaysLeft(NOW, { year: 2026, month: 1, day: 1 }, "UTC", "sat-sun").businessDays).toBe(0);
  });

  it("progress and milestones", () => {
    expect(countdownProgress(0, 100, 25)).toBe(0.25);
    expect(countdownProgress(0, 100, -5)).toBe(0);
    expect(countdownProgress(0, 100, 500)).toBe(1);
    expect(countdownProgress(100, 100, 50)).toBe(0);
    const ms = countdownMilestones(NOW + 10 * 86_400_000, NOW);
    expect(ms.map((m) => [m.key, m.passed])).toEqual([
      ["d100", true],
      ["d30", true],
      ["d7", false],
      ["d1", false],
      ["h1", false],
    ]);
  });
});

describe("yearly rollover", () => {
  it("rolls a Gregorian date that has passed this year to next year", () => {
    const occ = countdownNextOccurrence({ calendar: "gregorian", month: 9, day: 23 }, midnight, "Asia/Riyadh", NOW);
    expect(occ.date).toEqual({ year: 2027, month: 9, day: 23 });
    const coming = countdownNextOccurrence({ calendar: "gregorian", month: 12, day: 25 }, midnight, "Asia/Riyadh", NOW);
    expect(coming.date).toEqual({ year: 2026, month: 12, day: 25 });
  });

  it("keeps today's event until its time passes, then rolls", () => {
    const rule = { calendar: "gregorian" as const, month: 10, day: 17 };
    expect(countdownNextOccurrence(rule, { hour: 18, minute: 0 }, "UTC", NOW).date.year).toBe(2026);
    expect(countdownNextOccurrence(rule, { hour: 9, minute: 0 }, "UTC", NOW).date.year).toBe(2027);
  });

  it("Feb 29: Feb 28 (or Mar 1) in common years, Feb 29 in leap years", () => {
    const rule = { calendar: "gregorian" as const, month: 2, day: 29 };
    const occ = countdownNextOccurrence(rule, midnight, "UTC", NOW);
    expect(occ.date).toEqual({ year: 2027, month: 2, day: 28 });
    expect(occ.adjusted).toBe(true);
    const mar1 = countdownNextOccurrence({ ...rule, leapRule: "mar1" }, midnight, "UTC", NOW);
    expect(mar1.date).toEqual({ year: 2027, month: 3, day: 1 });
    const leap = countdownNextOccurrence(rule, midnight, "UTC", Date.UTC(2027, 5, 1));
    expect(leap.date).toEqual({ year: 2028, month: 2, day: 29 });
    expect(leap.adjusted).toBe(false);
    expect(countdownDateInYear(rule, 2100)!.date).toEqual({ year: 2100, month: 2, day: 28 });
  });

  it("previous occurrence is one year before the next", () => {
    const prev = countdownPreviousOccurrence({ calendar: "gregorian", month: 1, day: 1 }, midnight, "UTC", NOW);
    expect(prev.date).toEqual({ year: 2026, month: 1, day: 1 });
  });
});

describe("ICS output", () => {
  const base = {
    uid: "cd-1@tooloralabs.com",
    title: "Launch, v2; final",
    description: "Line one\nLine two",
    startUtcMs: Date.UTC(2026, 11, 31, 21, 0),
    durationMinutes: 60,
    stampUtcMs: NOW,
    zone: "Asia/Riyadh",
  };

  it("writes a one-off event in UTC with CRLF endings and escaped text", () => {
    const ics = buildCountdownIcs(base);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("\r\nDTSTART:20261231T210000Z\r\n");
    expect(ics).toContain("\r\nDTEND:20261231T220000Z\r\n");
    expect(ics).toContain("\r\nDTSTAMP:20261017T120000Z\r\n");
    expect(ics).toContain("\r\nSUMMARY:Launch\\, v2\\; final\r\n");
    expect(ics).toContain("\r\nDESCRIPTION:Line one\\nLine two\r\n");
    expect(ics).not.toContain("RRULE");
    expect(ics).not.toContain("VTIMEZONE");
    expect(ics.replace(/\r\n/g, "").includes("\n")).toBe(false);
  });

  it("writes a yearly event with TZID, a VTIMEZONE built from real DST rules and an alarm", () => {
    const ics = buildCountdownIcs({ ...base, zone: "America/New_York", startUtcMs: Date.UTC(2027, 4, 16, 21), yearly: true, alarmMinutesBefore: 1440 });
    expect(ics).toContain("TZID:America/New_York");
    expect(ics).toContain("RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU");
    expect(ics).toContain("RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU");
    expect(ics).toContain("DTSTART;TZID=America/New_York:20270516T170000");
    expect(ics).toContain("\r\nRRULE:FREQ=YEARLY\r\n");
    expect(ics).toContain("TRIGGER:-PT1440M");
    const eu = buildCountdownIcs({ ...base, zone: "Europe/Berlin", yearly: true });
    expect(eu).toContain("BYMONTH=3;BYDAY=-1SU");
    expect(eu).toContain("BYMONTH=10;BYDAY=-1SU");
  });

  it("escapes backslashes and folds long lines at 75 octets (UTF-8 aware)", () => {
    expect(icsEscapeText("a\\b")).toBe("a\\\\b");
    const long = `SUMMARY:${"عيد الفطر المبارك ".repeat(6)}`;
    const folded = icsFoldLine(long);
    const parts = folded.split("\r\n");
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) expect(new TextEncoder().encode(p).length).toBeLessThanOrEqual(75);
    expect(parts.slice(1).every((p) => p.startsWith(" "))).toBe(true);
    expect(parts.map((p, i) => (i ? p.slice(1) : p)).join("")).toBe(long);
    expect(icsFoldLine("SHORT:x")).toBe("SHORT:x");
  });

  it("builds a safe file name", () => {
    expect(countdownIcsFileName("Eid al-Fitr / 1448!", { year: 2027, month: 3, day: 9 })).toBe("eid-al-fitr-1448-2027-03-09.ics");
    expect(countdownIcsFileName("  ", { year: 2027, month: 1, day: 1 })).toBe("event-2027-01-01.ics");
  });
});
