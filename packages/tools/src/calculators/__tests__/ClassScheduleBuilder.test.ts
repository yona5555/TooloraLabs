import { describe, it, expect } from "vitest";
import { ClassScheduleBuilder } from "../ClassScheduleBuilder";

const context = { locale: "en-US" };
const calc = new ClassScheduleBuilder();

describe("ClassScheduleBuilder", () => {
  it("finds no conflicts for classes on different days", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "Math", days: ["mon", "wed"], startMinutes: 540, endMinutes: 630 },
          { name: "Chem", days: ["tue"], startMinutes: 540, endMinutes: 600 },
        ],
      },
      context
    );
    expect(r.data.error).toBeNull();
    expect(r.data.hasConflicts).toBe(false);
    expect(r.data.conflicts).toHaveLength(0);
  });

  it("detects an overlap between two classes sharing a day", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "Math", days: ["mon", "wed"], startMinutes: 540, endMinutes: 630 }, // 9:00-10:30
          { name: "Physics", days: ["mon"], startMinutes: 600, endMinutes: 660 }, // 10:00-11:00
        ],
      },
      context
    );
    expect(r.data.hasConflicts).toBe(true);
    expect(r.data.conflicts).toHaveLength(1);
    expect(r.data.conflicts[0]).toMatchObject({
      classNameA: "Math",
      classNameB: "Physics",
      day: "mon",
      overlapStartMinutes: 600,
      overlapEndMinutes: 630,
    });
  });

  it("does not flag back-to-back classes (one ends exactly when the other starts)", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "Math", days: ["mon"], startMinutes: 540, endMinutes: 600 },
          { name: "Physics", days: ["mon"], startMinutes: 600, endMinutes: 660 },
        ],
      },
      context
    );
    expect(r.data.hasConflicts).toBe(false);
  });

  it("only flags a conflict on the specific day(s) both classes share", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "Math", days: ["mon", "wed"], startMinutes: 540, endMinutes: 630 },
          { name: "Physics", days: ["wed", "fri"], startMinutes: 600, endMinutes: 660 },
        ],
      },
      context
    );
    expect(r.data.conflicts).toHaveLength(1);
    expect(r.data.conflicts[0].day).toBe("wed");
  });

  it("computes total weekly scheduled minutes across all classes and days", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "Math", days: ["mon", "wed"], startMinutes: 540, endMinutes: 630 }, // 90 min x 2
          { name: "Physics", days: ["mon"], startMinutes: 600, endMinutes: 660 }, // 60 min x 1
          { name: "Chem", days: ["tue"], startMinutes: 540, endMinutes: 600 }, // 60 min x 1
        ],
      },
      context
    );
    expect(r.data.totalWeeklyMinutes).toBe(180 + 60 + 60);
  });

  it("detects multiple simultaneous conflicts across three classes", () => {
    const r = calc.execute(
      {
        classes: [
          { name: "A", days: ["mon"], startMinutes: 540, endMinutes: 660 },
          { name: "B", days: ["mon"], startMinutes: 600, endMinutes: 630 },
          { name: "C", days: ["mon"], startMinutes: 615, endMinutes: 700 },
        ],
      },
      context
    );
    // A-B overlap, A-C overlap, B-C overlap => 3 pairwise conflicts
    expect(r.data.conflicts).toHaveLength(3);
  });

  it("flags an empty class list", () => {
    const r = calc.execute({ classes: [] }, context);
    expect(r.data.error).toBe("empty-schedule");
  });

  it("flags a class with end time not after start time", () => {
    const r = calc.execute({ classes: [{ name: "Math", days: ["mon"], startMinutes: 600, endMinutes: 600 }] }, context);
    expect(r.data.error).toBe("invalid-class-time");
  });

  it("flags a class with no meeting days", () => {
    const r = calc.execute({ classes: [{ name: "Math", days: [], startMinutes: 540, endMinutes: 600 }] }, context);
    expect(r.data.error).toBe("missing-days");
  });
});

import {
  addDays,
  buildVTimezone,
  escapeIcsText,
  findClassConflicts,
  foldIcsLine,
  icsUid,
  scheduleToIcs,
  termOccurrences,
  termWeeks,
  weekdayOf,
  weeklyScheduleStats,
  zonedTimeToUtc,
  type ScheduleClass,
} from "../ClassScheduleBuilder";

const cls = (id: string, days: ScheduleClass["days"], s: number, e: number, extra: Partial<ScheduleClass> = {}): ScheduleClass => ({
  id,
  name: id,
  days,
  startMinutes: s,
  endMinutes: e,
  ...extra,
});

describe("findClassConflicts", () => {
  it("reports a real overlap with its exact range and length", () => {
    const c = findClassConflicts([cls("A", ["mon", "wed"], 540, 630), cls("B", ["wed"], 600, 660)]);
    expect(c).toHaveLength(1);
    expect(c[0]).toMatchObject({ kind: "overlap", day: "wed", startMinutes: 600, endMinutes: 630, overlapMinutes: 30, gapMinutes: 0, touching: false });
  });

  it("treats touching edges as no conflict without a buffer", () => {
    expect(findClassConflicts([cls("A", ["mon"], 540, 600), cls("B", ["mon"], 600, 660)])).toHaveLength(0);
  });

  it("flags touching edges as a buffer conflict when a buffer is set", () => {
    const c = findClassConflicts([cls("A", ["mon"], 540, 600), cls("B", ["mon"], 600, 660)], { bufferMinutes: 10 });
    expect(c).toEqual([expect.objectContaining({ kind: "buffer", touching: true, gapMinutes: 0, startMinutes: 600, endMinutes: 600 })]);
  });

  it("flags a gap strictly shorter than the buffer, not one equal to it", () => {
    const pair = [cls("A", ["fri"], 540, 590), cls("B", ["fri"], 600, 650)];
    expect(findClassConflicts(pair, { bufferMinutes: 10 })).toHaveLength(0);
    const c = findClassConflicts(pair, { bufferMinutes: 15 });
    expect(c[0]).toMatchObject({ kind: "buffer", gapMinutes: 10, startMinutes: 590, endMinutes: 600 });
  });

  it("orders the gap correctly when the later class is listed first", () => {
    const c = findClassConflicts([cls("Late", ["tue"], 660, 720), cls("Early", ["tue"], 600, 655)], { bufferMinutes: 10 });
    expect(c[0]).toMatchObject({ startMinutes: 655, endMinutes: 660, gapMinutes: 5 });
  });

  it("detects containment and ignores invalid classes", () => {
    const c = findClassConflicts([cls("Lab", ["thu"], 840, 1010), cls("Film", ["thu"], 900, 975), cls("Bad", ["thu"], 900, 900)]);
    expect(c).toHaveLength(1);
    expect(c[0]).toMatchObject({ aId: "Lab", bId: "Film", overlapMinutes: 75 });
  });

  it("sorts conflicts by weekday then time", () => {
    const c = findClassConflicts([cls("A", ["fri", "mon"], 600, 700), cls("B", ["fri", "mon"], 650, 720)]);
    expect(c.map((x) => x.day)).toEqual(["mon", "fri"]);
  });
});

describe("weeklyScheduleStats", () => {
  const week = [
    cls("CS", ["mon", "wed", "fri"], 540, 590, { credits: 3 }),
    cls("PHYS", ["mon", "wed"], 660, 735, { credits: 3 }),
    cls("STAT", ["mon", "wed"], 735, 810, { credits: 3 }),
    cls("LAB", ["thu"], 840, 1010, { credits: 1 }),
    cls("FILM", ["thu"], 960, 1035, { credits: 3 }),
  ];
  const s = weeklyScheduleStats(week);
  const mon = s.days[0];

  it("totals minutes, meetings, campus days and credits", () => {
    expect(s.meetingsPerWeek).toBe(3 + 2 + 2 + 1 + 1);
    expect(s.totalMinutes).toBe(50 * 3 + 75 * 2 + 75 * 2 + 170 + 75);
    expect(s.campusDays).toBe(4);
    expect(s.totalCredits).toBe(13);
  });

  it("computes the day window, gaps and back-to-back streaks", () => {
    expect(mon).toMatchObject({ firstStart: 540, lastEnd: 810, spanMinutes: 270, classCount: 3, gapMinutes: 70, longestGapMinutes: 70, longestStreak: 2 });
    expect(mon.longestStreakRange).toEqual({ startMinutes: 660, endMinutes: 810, minutes: 150 });
    expect(mon.credits).toBeCloseTo(1 + 1.5 + 1.5);
  });

  it("counts overlapping time once in busy minutes", () => {
    const thu = s.days[3];
    expect(thu.scheduledMinutes).toBe(245);
    expect(thu.busyMinutes).toBe(1035 - 840);
    expect(thu.gaps).toHaveLength(0);
  });

  it("finds earliest start, latest end, busiest day and longest gap", () => {
    expect(s.earliestStart).toBe(540);
    expect(s.earliestDay).toBe("mon");
    expect(s.latestEnd).toBe(1035);
    expect(s.latestDay).toBe("thu");
    expect(s.busiestDay).toBe("thu"); // 245 scheduled minutes (overlap counted twice) vs Monday 200
    expect(s.longestGap).toMatchObject({ day: "mon", minutes: 70 });
  });

  it("honours a custom streak gap", () => {
    expect(weeklyScheduleStats(week, { streakGapMinutes: 70 }).days[0].longestStreak).toBe(3);
  });

  it("returns empty stats for no classes", () => {
    const e = weeklyScheduleStats([]);
    expect(e).toMatchObject({ campusDays: 0, totalMinutes: 0, earliestStart: null, longestGap: null, averageCampusDayMinutes: 0 });
  });
});

describe("term dates", () => {
  it("knows weekdays and adds days", () => {
    expect(weekdayOf("2026-09-07")).toBe("mon");
    expect(weekdayOf("2026-12-18")).toBe("fri");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("lists occurrences inside the term minus excluded dates", () => {
    const d = termOccurrences({ days: ["tue", "thu"] }, "2026-09-07", "2026-09-20", ["2026-09-10"]);
    expect(d).toEqual(["2026-09-08", "2026-09-15", "2026-09-17"]);
    expect(termOccurrences({ days: ["mon"] }, "2026-09-10", "2026-09-01")).toEqual([]);
  });

  it("counts calendar weeks", () => {
    expect(termWeeks("2026-09-07", "2026-12-18")).toBe(15);
    expect(termWeeks("2026-09-09", "2026-09-14")).toBe(2);
  });
});

describe("iCalendar export", () => {
  const now = new Date(Date.UTC(2026, 9, 16, 8, 30, 0));
  const classes = [
    cls("cs201", ["mon", "wed", "fri"], 540, 590, { code: "CS 201", name: "Data Structures", location: "Eng Hall 120, Room B; 2nd floor", instructor: "Dr. Lin", credits: 3, kind: "lecture" }),
    cls("lab", ["thu"], 840, 1010, { name: "Physics Lab", kind: "lab" }),
  ];
  const base = { termStart: "2026-09-09", termEnd: "2026-12-18", now };

  it("wraps events in VCALENDAR with CRLF line endings only", () => {
    const ics = scheduleToIcs(classes, base);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("PRODID:-//ToolOraLabs//Class Schedule Builder//EN");
  });

  it("starts each event on its first meeting date with a weekly BYDAY rule (floating)", () => {
    const ics = scheduleToIcs(classes, base);
    // 2026-09-09 is a Wednesday: CS meets Mon/Wed/Fri, so it starts that day; the lab starts Thursday the 10th.
    expect(ics).toContain("DTSTART:20260909T090000\r\nDTEND:20260909T095000\r\nRRULE:FREQ=WEEKLY;WKST=MO;BYDAY=MO,WE,FR;UNTIL=20261218T235959\r\n");
    expect(ics).toContain("DTSTART:20260910T140000\r\nDTEND:20260910T165000\r\nRRULE:FREQ=WEEKLY;WKST=MO;BYDAY=TH;UNTIL=20261218T235959\r\n");
    expect(ics).toContain("DTSTAMP:20261016T083000Z");
    expect(ics).not.toContain("VTIMEZONE");
  });

  it("escapes commas, semicolons, backslashes and newlines in TEXT values", () => {
    expect(escapeIcsText("a,b;c\\d\ne")).toBe("a\\,b\;c\\\\d\\ne");
    const ics = scheduleToIcs(classes, base).replace(/\r\n /g, "");
    expect(ics).toContain("SUMMARY:CS 201 Data Structures\r\n");
    expect(ics).toContain("LOCATION:Eng Hall 120\\, Room B\; 2nd floor\r\n");
    expect(ics).toContain("DESCRIPTION:lecture\\nInstructor: Dr. Lin\\nCredits: 3\r\n");
  });

  it("folds lines at 75 octets without splitting UTF-8 characters", () => {
    const ascii = "DESCRIPTION:" + "x".repeat(200);
    const folded = foldIcsLine(ascii);
    const parts = folded.split("\r\n");
    expect(parts[0]).toHaveLength(75);
    parts.slice(1).forEach((p) => expect(p.startsWith(" ")).toBe(true));
    parts.forEach((p) => expect(p.length).toBeLessThanOrEqual(75));
    expect(folded.replace(/\r\n /g, "")).toBe(ascii);

    const arabic = "SUMMARY:" + "محاضرة الفيزياء ".repeat(8);
    const fa = foldIcsLine(arabic);
    const octets = (s: string) => Buffer.byteLength(s, "utf8");
    fa.split("\r\n").forEach((p) => expect(octets(p)).toBeLessThanOrEqual(75));
    expect(fa.replace(/\r\n /g, "")).toBe(arabic);
    expect(foldIcsLine("SHORT:line")).toBe("SHORT:line");
  });

  it("uses stable UIDs that depend on the class id only", () => {
    const a = scheduleToIcs(classes, base);
    const b = scheduleToIcs([{ ...classes[0], startMinutes: 600, endMinutes: 650 }, classes[1]], base);
    const uids = (s: string) => s.match(/UID:[^\r]+/g);
    expect(uids(a)).toEqual(uids(b));
    expect(new Set(uids(a)).size).toBe(2);
    expect(icsUid({ id: "cs201", name: "x" })).toMatch(/^class-[0-9a-f]{8}-[0-9a-f]{8}@tooloralabs\.com$/);
  });

  it("uses TZID with a matching VTIMEZONE and a UTC UNTIL", () => {
    const ics = scheduleToIcs(classes, { ...base, tzid: "America/New_York" });
    expect(ics).toContain("DTSTART;TZID=America/New_York:20260909T090000");
    expect(ics).toContain("DTEND;TZID=America/New_York:20260909T095000");
    // 23:59:59 EST (UTC−5) on Dec 18 = 04:59:59Z on Dec 19.
    expect(ics).toContain("UNTIL=20261219T045959Z");
    expect(ics).toContain("BEGIN:VTIMEZONE\r\nTZID:America/New_York\r\n");
    // 2026 DST in New York: starts Mar 8 at 02:00, ends Nov 1 at 02:00 local.
    expect(ics).toContain("BEGIN:DAYLIGHT\r\nDTSTART:20260308T020000\r\nTZOFFSETFROM:-0500\r\nTZOFFSETTO:-0400\r\nEND:DAYLIGHT");
    expect(ics).toContain("BEGIN:STANDARD\r\nDTSTART:20261101T020000\r\nTZOFFSETFROM:-0400\r\nTZOFFSETTO:-0500\r\nEND:STANDARD");
  });

  it("builds a single observance for zones without DST", () => {
    expect(buildVTimezone("Asia/Riyadh", 2026, 2026)).toEqual([
      "BEGIN:VTIMEZONE",
      "TZID:Asia/Riyadh",
      "BEGIN:STANDARD",
      "DTSTART:19700101T000000",
      "TZOFFSETFROM:+0300",
      "TZOFFSETTO:+0300",
      "END:STANDARD",
      "END:VTIMEZONE",
    ]);
    expect(zonedTimeToUtc("2026-09-09", 9 * 60, 0, "Asia/Riyadh")).toBe(Date.UTC(2026, 8, 9, 6, 0, 0));
  });

  it("falls back to floating times for an invalid zone", () => {
    const ics = scheduleToIcs(classes, { ...base, tzid: "Mars/Olympus" });
    expect(ics).toContain("DTSTART:20260909T090000");
    expect(ics).not.toContain("TZID");
  });

  it("writes EXDATE for excluded meeting dates only", () => {
    const ics = scheduleToIcs(classes, { ...base, excludeDates: ["2026-11-26", "2026-11-27", "2026-11-28"] });
    expect(ics).toContain("EXDATE:20261127T090000"); // Friday: CS meets
    expect(ics).toContain("EXDATE:20261126T140000"); // Thursday: lab meets
    expect(ics).not.toContain("EXDATE:20261128");
  });

  it("emits an empty calendar for an invalid term or no classes", () => {
    expect(scheduleToIcs(classes, { ...base, termEnd: "2026-01-01" })).toBe(
      "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//ToolOraLabs//Class Schedule Builder//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nEND:VCALENDAR\r\n"
    );
  });
});
