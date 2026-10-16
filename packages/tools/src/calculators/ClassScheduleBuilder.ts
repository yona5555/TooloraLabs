import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type DayCode = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAY_CODES: DayCode[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export type ClassEntryInput = {
  name: string;
  days: DayCode[];
  startMinutes: number;
  endMinutes: number;
};

export type ClassScheduleBuilderInput = {
  classes: ClassEntryInput[];
};

export type ClassScheduleBuilderError = "empty-schedule" | "invalid-class-time" | "missing-days";

export type ScheduleConflict = {
  classNameA: string;
  classNameB: string;
  day: DayCode;
  overlapStartMinutes: number;
  overlapEndMinutes: number;
};

export type ClassScheduleBuilderOutput = {
  error: ClassScheduleBuilderError | null;
  errorDetail: string | null;
  conflicts: ScheduleConflict[];
  totalWeeklyMinutes: number;
  hasConflicts: boolean;
};

/**
 * Detects day/time overlaps across a list of weekly class meeting times and
 * totals scheduled hours. Two classes conflict only on days they both meet,
 * and only if their [start, end) time intervals actually overlap on that
 * day — meeting back-to-back (one ends exactly when the other starts) does
 * not count as a conflict.
 */
export class ClassScheduleBuilder extends BaseCalculator<ClassScheduleBuilderInput, ClassScheduleBuilderOutput> {
  metadata = {
    id: "class-schedule-builder",
    slug: "class-schedule-builder",
    name: "Class Schedule Builder",
    category: "calculators",
    description: "Build a weekly class schedule and automatically detect any day/time conflicts between classes.",
    version: "1.0.0",
  };

  execute(input: ClassScheduleBuilderInput, _context: ToolContext): ToolResult<ClassScheduleBuilderOutput> {
    const { classes } = input;

    if (classes.length === 0) {
      return this.errorResult("empty-schedule", "Add at least one class to build a schedule.");
    }

    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      if (!(cls.endMinutes > cls.startMinutes)) {
        return this.errorResult("invalid-class-time", `"${cls.name || `Class ${i + 1}`}" needs an end time after its start time.`);
      }
      if (cls.days.length === 0) {
        return this.errorResult("missing-days", `"${cls.name || `Class ${i + 1}`}" needs at least one meeting day.`);
      }
    }

    const conflicts: ScheduleConflict[] = [];
    for (let i = 0; i < classes.length; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        const a = classes[i];
        const b = classes[j];
        const sharedDays = a.days.filter((day) => b.days.includes(day));
        for (const day of sharedDays) {
          const overlapStart = Math.max(a.startMinutes, b.startMinutes);
          const overlapEnd = Math.min(a.endMinutes, b.endMinutes);
          if (overlapStart < overlapEnd) {
            conflicts.push({
              classNameA: a.name,
              classNameB: b.name,
              day,
              overlapStartMinutes: overlapStart,
              overlapEndMinutes: overlapEnd,
            });
          }
        }
      }
    }

    const totalWeeklyMinutes = classes.reduce((sum, cls) => sum + (cls.endMinutes - cls.startMinutes) * cls.days.length, 0);

    return {
      success: true,
      data: { error: null, errorDetail: null, conflicts, totalWeeklyMinutes, hasConflicts: conflicts.length > 0 },
      metadata: {},
    };
  }

  private errorResult(error: ClassScheduleBuilderError, detail: string): ToolResult<ClassScheduleBuilderOutput> {
    return {
      success: true,
      data: { error, errorDetail: detail, conflicts: [], totalWeeklyMinutes: 0, hasConflicts: false },
      metadata: {},
    };
  }
}

/* ------------------------------------------------------------------------------------------------
 * Schedule studio: conflicts with a buffer, weekly statistics, term dates and RFC 5545 (.ics) export.
 * Pure logic (no DOM). Times are minutes after local midnight; dates are ISO "YYYY-MM-DD" strings.
 * ---------------------------------------------------------------------------------------------- */

export type ClassKind = "lecture" | "lab" | "seminar" | "tutorial";
export const CLASS_KINDS: ClassKind[] = ["lecture", "lab", "seminar", "tutorial"];

export type ScheduleClass = {
  /** Stable id: the .ics UID is derived from it, so re-importing updates instead of duplicating. */
  id: string;
  name: string;
  code?: string;
  kind?: ClassKind;
  days: DayCode[];
  startMinutes: number;
  endMinutes: number;
  location?: string;
  instructor?: string;
  credits?: number;
};

export function isValidClass(c: Pick<ScheduleClass, "days" | "startMinutes" | "endMinutes">): boolean {
  return c.days.length > 0 && c.startMinutes >= 0 && c.endMinutes <= 24 * 60 && c.endMinutes > c.startMinutes;
}

export const dayIndex = (d: DayCode) => DAY_CODES.indexOf(d);

/* ---------- conflicts ---------- */

export type ClassConflictKind = "overlap" | "buffer";

export type ClassConflict = {
  aId: string;
  bId: string;
  aName: string;
  bName: string;
  day: DayCode;
  /** "overlap": both meet at the same time. "buffer": no overlap, but the gap is shorter than the buffer. */
  kind: ClassConflictKind;
  /** Overlap range (overlap) or the gap between the two classes (buffer). */
  startMinutes: number;
  endMinutes: number;
  overlapMinutes: number;
  /** Minutes between the end of the earlier class and the start of the later one (0 when they touch or overlap). */
  gapMinutes: number;
  /** One class ends exactly when the other starts. */
  touching: boolean;
};

/**
 * Pairwise conflicts on shared days. Intervals are half-open [start, end): touching edges
 * (10:00–11:00 then 11:00–12:00) never overlap, but with a buffer > 0 they are a "buffer"
 * conflict because there is no time to walk between rooms. A gap g is flagged when g < buffer.
 */
export function findClassConflicts(classes: ScheduleClass[], options: { bufferMinutes?: number } = {}): ClassConflict[] {
  const buffer = Math.max(0, options.bufferMinutes ?? 0);
  const valid = classes.filter(isValidClass);
  const out: ClassConflict[] = [];
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const a = valid[i];
      const b = valid[j];
      for (const day of DAY_CODES) {
        if (!a.days.includes(day) || !b.days.includes(day)) continue;
        const os = Math.max(a.startMinutes, b.startMinutes);
        const oe = Math.min(a.endMinutes, b.endMinutes);
        const base = { aId: a.id, bId: b.id, aName: a.name, bName: b.name, day };
        if (os < oe) {
          out.push({ ...base, kind: "overlap", startMinutes: os, endMinutes: oe, overlapMinutes: oe - os, gapMinutes: 0, touching: false });
          continue;
        }
        const [first, second] = a.endMinutes <= b.startMinutes ? [a, b] : [b, a];
        const gap = second.startMinutes - first.endMinutes;
        if (gap < buffer) {
          out.push({ ...base, kind: "buffer", startMinutes: first.endMinutes, endMinutes: second.startMinutes, overlapMinutes: 0, gapMinutes: gap, touching: gap === 0 });
        }
      }
    }
  }
  return out.sort((x, y) => dayIndex(x.day) - dayIndex(y.day) || x.startMinutes - y.startMinutes);
}

/* ---------- weekly statistics ---------- */

export type DayMeeting = { id: string; name: string; startMinutes: number; endMinutes: number };
export type TimeRange = { startMinutes: number; endMinutes: number; minutes: number };

export type DayStats = {
  day: DayCode;
  meetings: DayMeeting[];
  classCount: number;
  /** Sum of class lengths (overlaps counted twice). */
  scheduledMinutes: number;
  /** Union of class time (overlaps counted once). */
  busyMinutes: number;
  firstStart: number | null;
  lastEnd: number | null;
  /** First start to last end: the time the student is on campus for classes. */
  spanMinutes: number;
  /** Free gaps between classes inside the span. */
  gaps: TimeRange[];
  gapMinutes: number;
  longestGapMinutes: number;
  /** Longest chain of classes whose gaps are all <= streakGapMinutes. */
  longestStreak: number;
  longestStreakRange: TimeRange | null;
  /** Each class's credits spread evenly over its meeting days. */
  credits: number;
};

export type WeeklyScheduleStats = {
  days: DayStats[];
  classCount: number;
  meetingsPerWeek: number;
  totalMinutes: number;
  busyMinutes: number;
  campusDays: number;
  earliestStart: number | null;
  earliestDay: DayCode | null;
  latestEnd: number | null;
  latestDay: DayCode | null;
  busiestDay: DayCode | null;
  averageCampusDayMinutes: number;
  totalGapMinutes: number;
  longestGap: (TimeRange & { day: DayCode }) | null;
  longestStreak: { day: DayCode; count: number; range: TimeRange } | null;
  totalCredits: number;
};

const range = (s: number, e: number): TimeRange => ({ startMinutes: s, endMinutes: e, minutes: e - s });

export function weeklyScheduleStats(classes: ScheduleClass[], options: { streakGapMinutes?: number } = {}): WeeklyScheduleStats {
  const streakGap = Math.max(0, options.streakGapMinutes ?? 15);
  const valid = classes.filter(isValidClass);
  const days: DayStats[] = DAY_CODES.map((day) => {
    const meetings = valid
      .filter((c) => c.days.includes(day))
      .map((c) => ({ id: c.id, name: c.name, startMinutes: c.startMinutes, endMinutes: c.endMinutes }))
      .sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);
    const merged: [number, number][] = [];
    for (const m of meetings) {
      const last = merged[merged.length - 1];
      if (last && m.startMinutes <= last[1]) last[1] = Math.max(last[1], m.endMinutes);
      else merged.push([m.startMinutes, m.endMinutes]);
    }
    const gaps = merged.slice(1).map((m, i) => range(merged[i][1], m[0])).filter((g) => g.minutes > 0);
    let best: { count: number; s: number; e: number } | null = null;
    let cur: { count: number; s: number; e: number } | null = null;
    for (const m of meetings) {
      if (cur && m.startMinutes - cur.e <= streakGap) {
        cur.count += 1;
        cur.e = Math.max(cur.e, m.endMinutes);
      } else cur = { count: 1, s: m.startMinutes, e: m.endMinutes };
      if (!best || cur.count > best.count || (cur.count === best.count && cur.e - cur.s > best.e - best.s)) best = { ...cur };
    }
    const firstStart = merged.length ? merged[0][0] : null;
    const lastEnd = merged.length ? merged[merged.length - 1][1] : null;
    return {
      day,
      meetings,
      classCount: meetings.length,
      scheduledMinutes: meetings.reduce((a, m) => a + m.endMinutes - m.startMinutes, 0),
      busyMinutes: merged.reduce((a, [s, e]) => a + e - s, 0),
      firstStart,
      lastEnd,
      spanMinutes: firstStart === null || lastEnd === null ? 0 : lastEnd - firstStart,
      gaps,
      gapMinutes: gaps.reduce((a, g) => a + g.minutes, 0),
      longestGapMinutes: gaps.reduce((a, g) => Math.max(a, g.minutes), 0),
      longestStreak: best?.count ?? 0,
      longestStreakRange: best ? range(best.s, best.e) : null,
      credits: valid.filter((c) => c.days.includes(day)).reduce((a, c) => a + (c.credits ?? 0) / c.days.length, 0),
    };
  });

  const campus = days.filter((d) => d.classCount > 0);
  let earliest: DayStats | null = null;
  let latest: DayStats | null = null;
  let busiest: DayStats | null = null;
  let longestGap: WeeklyScheduleStats["longestGap"] = null;
  let longestStreak: WeeklyScheduleStats["longestStreak"] = null;
  for (const d of campus) {
    if (!earliest || (d.firstStart ?? 0) < (earliest.firstStart ?? 0)) earliest = d;
    if (!latest || (d.lastEnd ?? 0) > (latest.lastEnd ?? 0)) latest = d;
    if (!busiest || d.scheduledMinutes > busiest.scheduledMinutes) busiest = d;
    for (const g of d.gaps) if (!longestGap || g.minutes > longestGap.minutes) longestGap = { ...g, day: d.day };
    if (d.longestStreakRange && (!longestStreak || d.longestStreak > longestStreak.count)) longestStreak = { day: d.day, count: d.longestStreak, range: d.longestStreakRange };
  }
  const totalMinutes = days.reduce((a, d) => a + d.scheduledMinutes, 0);
  return {
    days,
    classCount: valid.length,
    meetingsPerWeek: days.reduce((a, d) => a + d.classCount, 0),
    totalMinutes,
    busyMinutes: days.reduce((a, d) => a + d.busyMinutes, 0),
    campusDays: campus.length,
    earliestStart: earliest?.firstStart ?? null,
    earliestDay: earliest?.day ?? null,
    latestEnd: latest?.lastEnd ?? null,
    latestDay: latest?.day ?? null,
    busiestDay: busiest?.day ?? null,
    averageCampusDayMinutes: campus.length ? campus.reduce((a, d) => a + d.spanMinutes, 0) / campus.length : 0,
    totalGapMinutes: days.reduce((a, d) => a + d.gapMinutes, 0),
    longestGap,
    longestStreak,
    totalCredits: valid.reduce((a, c) => a + (c.credits ?? 0), 0),
  };
}

/* ---------- term dates ---------- */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseIsoDate(iso: string): { y: number; m: number; d: number } | null {
  const m = ISO_DATE.exec(iso.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d ? { y, m: mo, d } : null;
}

const isoToMs = (iso: string) => {
  const p = parseIsoDate(iso);
  return p ? Date.UTC(p.y, p.m - 1, p.d) : NaN;
};
const msToIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const DAY_MS = 86_400_000;

/** Day code of an ISO date (Monday = "mon"). */
export function weekdayOf(iso: string): DayCode {
  return DAY_CODES[(new Date(isoToMs(iso)).getUTCDay() + 6) % 7];
}

export function addDays(iso: string, n: number): string {
  return msToIso(isoToMs(iso) + n * DAY_MS);
}

/** Every date in [termStart, termEnd] on which the class meets, minus excluded dates (breaks, holidays). */
export function termOccurrences(c: Pick<ScheduleClass, "days">, termStart: string, termEnd: string, excludeDates: string[] = []): string[] {
  const s = isoToMs(termStart);
  const e = isoToMs(termEnd);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return [];
  const skip = new Set(excludeDates);
  const out: string[] = [];
  for (let t = s; t <= e; t += DAY_MS) {
    const iso = msToIso(t);
    if (c.days.includes(weekdayOf(iso)) && !skip.has(iso)) out.push(iso);
  }
  return out;
}

/** Calendar weeks touched by the term (partial weeks count). */
export function termWeeks(termStart: string, termEnd: string): number {
  const s = isoToMs(termStart);
  const e = isoToMs(termEnd);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return 0;
  const monday = s - dayIndex(weekdayOf(termStart)) * DAY_MS;
  return Math.floor((e - monday) / DAY_MS / 7) + 1;
}

/* ---------- iCalendar (RFC 5545) ---------- */

const BYDAY: Record<DayCode, string> = { mon: "MO", tue: "TU", wed: "WE", thu: "TH", fri: "FR", sat: "SA", sun: "SU" };

/** TEXT value escaping (RFC 5545 §3.3.11): backslash, semicolon, comma and newlines. */
export function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
}

const utf8Length = (ch: string) => {
  const cp = ch.codePointAt(0) ?? 0;
  return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
};

/**
 * Content-line folding (RFC 5545 §3.1): lines longer than 75 octets are split with CRLF + one
 * space. Octets are counted in UTF-8 and a multi-byte character is never split.
 */
export function foldIcsLine(line: string): string {
  const parts: string[] = [];
  let cur = "";
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const n = utf8Length(ch);
    if (bytes + n > limit) {
      parts.push(cur);
      cur = "";
      bytes = 0;
      limit = 74; // the leading space of a continuation line is one of its 75 octets
    }
    cur += ch;
    bytes += n;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

/** 32-bit FNV-1a hash as 8 hex digits (stable UIDs without crypto). */
export function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Stable UID: depends only on the class id, so editing a class keeps the same calendar event. */
export function icsUid(c: Pick<ScheduleClass, "id" | "name">, domain = "tooloralabs.com"): string {
  const key = c.id || c.name;
  return `class-${fnv1a(key)}-${fnv1a(`${key}#`)}@${domain}`;
}

const pad = (n: number, w = 2) => String(Math.trunc(Math.abs(n))).padStart(w, "0");
const compactDate = (iso: string) => iso.replace(/-/g, "");
const localStamp = (iso: string, minutes: number) => `${compactDate(iso)}T${pad(Math.floor(minutes / 60))}${pad(minutes % 60)}00`;
const utcStamp = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
};
const offsetText = (min: number) => `${min < 0 ? "-" : "+"}${pad(Math.floor(Math.abs(min) / 60))}${pad(Math.abs(min) % 60)}`;

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function offsetFn(tz: string) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  /** UTC offset of `tz` in minutes at the instant `ms`. */
  return (ms: number) => {
    const p: Record<string, number> = {};
    for (const part of f.formatToParts(new Date(ms))) if (part.type !== "literal") p[part.type] = Number(part.value);
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
    return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
  };
}

/** UTC instant of a wall-clock time in `tz`. */
export function zonedTimeToUtc(iso: string, minutes: number, seconds: number, tz: string): number {
  const off = offsetFn(tz);
  const wall = isoToMs(iso) + minutes * 60000 + seconds * 1000;
  let utc = wall - off(wall) * 60000;
  const second = off(utc);
  utc = wall - second * 60000;
  return utc;
}

/** VTIMEZONE built from the time zone's real offset transitions in the years the term covers. */
export function buildVTimezone(tz: string, fromYear: number, toYear: number): string[] {
  const off = offsetFn(tz);
  const start = Date.UTC(fromYear, 0, 1, 12);
  const end = Date.UTC(toYear + 1, 0, 1, 12);
  const transitions: { at: number; from: number; to: number }[] = [];
  let prevMs = start;
  let prevOff = off(start);
  for (let t = start + DAY_MS; t <= end; t += DAY_MS) {
    const o = off(t);
    if (o !== prevOff) {
      let lo = prevMs;
      let hi = t;
      while (hi - lo > 60000) {
        const mid = Math.floor((lo + hi) / 2 / 60000) * 60000;
        if (off(mid) === prevOff) lo = mid;
        else hi = mid;
      }
      transitions.push({ at: hi, from: prevOff, to: o });
      prevOff = o;
    }
    prevMs = t;
  }
  const baseOff = off(start);
  const offs = [baseOff, ...transitions.map((x) => x.to)];
  const minOff = Math.min(...offs);
  const maxOff = Math.max(...offs);
  const lines = ["BEGIN:VTIMEZONE", `TZID:${tz}`];
  const kind = (o: number) => (minOff !== maxOff && o === maxOff ? "DAYLIGHT" : "STANDARD");
  lines.push(`BEGIN:${kind(baseOff)}`, "DTSTART:19700101T000000", `TZOFFSETFROM:${offsetText(baseOff)}`, `TZOFFSETTO:${offsetText(baseOff)}`, `END:${kind(baseOff)}`);
  for (const tr of transitions) {
    const k = tr.to > tr.from ? "DAYLIGHT" : "STANDARD";
    const local = utcStamp(tr.at + tr.from * 60000).slice(0, 15);
    lines.push(`BEGIN:${k}`, `DTSTART:${local}`, `TZOFFSETFROM:${offsetText(tr.from)}`, `TZOFFSETTO:${offsetText(tr.to)}`, `END:${k}`);
  }
  lines.push("END:VTIMEZONE");
  return lines;
}

export type IcsOptions = {
  termStart: string;
  termEnd: string;
  /** IANA time zone (e.g. "Europe/Berlin") for DTSTART;TZID=…; null or invalid → floating local times. */
  tzid?: string | null;
  calendarName?: string;
  /** Dates with no classes (breaks, holidays) → EXDATE. */
  excludeDates?: string[];
  /** DTSTAMP instant; pass a fixed date for reproducible output. */
  now?: Date;
  /** Labels used in DESCRIPTION (translated by the caller). */
  labels?: { instructor?: string; credits?: string; kind?: Partial<Record<ClassKind, string>> };
  uidDomain?: string;
};

/**
 * Weekly recurring events for a term: one VEVENT per class with DTSTART on the first meeting
 * date on/after the term start, RRULE:FREQ=WEEKLY;BYDAY=…;UNTIL=… and CRLF line endings.
 * With a TZID the UNTIL is the UTC instant of 23:59:59 on the last term day (RFC 5545 §3.3.10);
 * floating times use a floating UNTIL.
 */
export function scheduleToIcs(classes: ScheduleClass[], options: IcsOptions): string {
  const tz = options.tzid && isValidTimeZone(options.tzid) ? options.tzid : null;
  const s = parseIsoDate(options.termStart);
  const e = parseIsoDate(options.termEnd);
  const stamp = utcStamp((options.now ?? new Date()).getTime());
  const labels = options.labels ?? {};
  const lines: string[] = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ToolOraLabs//Class Schedule Builder//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  if (options.calendarName) lines.push(`X-WR-CALNAME:${escapeIcsText(options.calendarName)}`);
  if (tz) lines.push(`X-WR-TIMEZONE:${tz}`);
  const valid = s && e && isoToMs(options.termEnd) >= isoToMs(options.termStart) ? classes.filter(isValidClass) : [];
  if (tz && s && e && valid.length) lines.push(...buildVTimezone(tz, s.y, e.y));
  const dt = (name: string, iso: string, minutes: number) => (tz ? `${name};TZID=${tz}:${localStamp(iso, minutes)}` : `${name}:${localStamp(iso, minutes)}`);
  const until = tz ? utcStamp(zonedTimeToUtc(options.termEnd, 23 * 60 + 59, 59, tz)) : `${compactDate(options.termEnd)}T235959`;

  for (const c of valid) {
    const dates = termOccurrences(c, options.termStart, options.termEnd);
    if (!dates.length) continue;
    const first = dates[0];
    const byday = DAY_CODES.filter((d) => c.days.includes(d)).map((d) => BYDAY[d]).join(",");
    const summary = c.code ? `${c.code} ${c.name}`.trim() : c.name;
    const desc = [
      c.kind ? (labels.kind?.[c.kind] ?? c.kind) : "",
      c.instructor ? `${labels.instructor ?? "Instructor"}: ${c.instructor}` : "",
      c.credits ? `${labels.credits ?? "Credits"}: ${c.credits}` : "",
    ].filter(Boolean);
    lines.push("BEGIN:VEVENT", `UID:${icsUid(c, options.uidDomain)}`, `DTSTAMP:${stamp}`, dt("DTSTART", first, c.startMinutes), dt("DTEND", first, c.endMinutes));
    lines.push(`RRULE:FREQ=WEEKLY;WKST=MO;BYDAY=${byday};UNTIL=${until}`);
    const skipped = (options.excludeDates ?? []).filter((d) => dates.includes(d)).sort();
    for (const d of skipped) lines.push(dt("EXDATE", d, c.startMinutes));
    lines.push(`SUMMARY:${escapeIcsText(summary || "Class")}`);
    if (c.location) lines.push(`LOCATION:${escapeIcsText(c.location)}`);
    if (desc.length) lines.push(`DESCRIPTION:${escapeIcsText(desc.join("\n"))}`);
    if (c.kind) lines.push(`CATEGORIES:${escapeIcsText(c.kind.toUpperCase())}`);
    lines.push("TRANSP:OPAQUE", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}
