/**
 * Pure logic for the Countdown to Event tool: zone-aware target instants (DST gaps and
 * overlaps flagged), Gregorian and Hijri (Umm al-Qura) event dates, presets computed from
 * the calendars (never hardcoded), yearly roll-over (incl. Feb 29), business days left with a
 * selectable weekend, progress from a start date, milestones and an RFC 5545 .ics builder.
 * The caller supplies "now"; nothing here reads a clock or touches the DOM.
 */
import {
  civilToUtcMs,
  countBusinessDays,
  daysInMonth,
  findOffsetTransitions,
  formatIsoDate,
  gregorianToHijri,
  hijriMonthLength,
  hijriToGregorian,
  isDstActive,
  isLeapYear,
  utcMsToCivil,
  zonedParts,
  zonedToUtc,
  zoneOffsetMinutes,
  type BusinessDayCount,
  type CivilDate,
  type HijriDate,
  type WeekendPreset,
} from "./DateTimeCore";

const DAY_MS = 86_400_000;

export type CountdownCalendar = "gregorian" | "hijri";
export type CountdownLeapRule = "feb28" | "mar1";

/** Wall-clock time of the event (24 h). */
export type CountdownClock = { hour: number; minute: number };

export type CountdownTarget = {
  /** The Gregorian civil date of the event in its own zone. */
  date: CivilDate;
  utcMs: number;
  /** "gap": the wall time does not exist (spring-forward), shifted forward; "overlap": it occurs twice, earlier chosen. */
  status: "ok" | "gap" | "overlap";
  /** Zone offset in effect at the event instant, minutes east of UTC. */
  offsetMinutes: number;
  dst: boolean;
};

/** The UTC instant of a wall-clock date + time in an IANA zone, via Intl (no hardcoded offsets). */
export function countdownResolveTarget(date: CivilDate, clock: CountdownClock, zone: string): CountdownTarget {
  const r = zonedToUtc({ ...date, hour: clock.hour, minute: clock.minute, second: 0 }, zone);
  return {
    date,
    utcMs: r.utcMs,
    status: r.status,
    offsetMinutes: zoneOffsetMinutes(r.utcMs, zone),
    dst: isDstActive(r.utcMs, zone),
  };
}

/** The civil date of an instant in a zone. */
export function countdownCivilInZone(utcMs: number, zone: string): CivilDate {
  const p = zonedParts(utcMs, zone);
  return { year: p.year, month: p.month, day: p.day };
}

// ---------------------------------------------------------------------------
// Yearly recurrence
// ---------------------------------------------------------------------------

/** An event that repeats every year on the same Gregorian or Hijri month/day. */
export type CountdownYearlyRule = {
  calendar: CountdownCalendar;
  month: number;
  day: number;
  /** What a Feb 29 event does in a common year (Gregorian only). */
  leapRule?: CountdownLeapRule;
};

/** The rule's date in a given (Gregorian or Hijri) year, clamped to real month lengths. */
export function countdownDateInYear(rule: CountdownYearlyRule, year: number): { date: CivilDate; adjusted: boolean } | null {
  if (rule.calendar === "gregorian") {
    if (rule.month === 2 && rule.day === 29 && !isLeapYear(year)) {
      return rule.leapRule === "mar1"
        ? { date: { year, month: 3, day: 1 }, adjusted: true }
        : { date: { year, month: 2, day: 28 }, adjusted: true };
    }
    const dim = daysInMonth(year, rule.month);
    const day = Math.min(rule.day, dim);
    return { date: { year, month: rule.month, day }, adjusted: day !== rule.day };
  }
  const len = hijriMonthLength(year, rule.month);
  const day = Math.min(rule.day, len);
  const g = hijriToGregorian({ year, month: rule.month, day });
  return g ? { date: g, adjusted: day !== rule.day } : null;
}

export type CountdownOccurrence = CountdownTarget & { year: number; adjusted: boolean };

/**
 * Next occurrence (at or after `nowMs`) of a yearly rule at a wall time in a zone. The year is
 * Gregorian or Hijri to match the rule's calendar.
 */
export function countdownNextOccurrence(rule: CountdownYearlyRule, clock: CountdownClock, zone: string, nowMs: number): CountdownOccurrence {
  const today = countdownCivilInZone(nowMs, zone);
  const startYear = rule.calendar === "gregorian" ? today.year : gregorianToHijri(today).year;
  for (let y = startYear - 1; y <= startYear + 3; y++) {
    const d = countdownDateInYear(rule, y);
    if (!d) continue;
    const t = countdownResolveTarget(d.date, clock, zone);
    if (t.utcMs >= nowMs) return { ...t, year: y, adjusted: d.adjusted };
  }
  // Unreachable for valid rules; fall back to the rule in the start year.
  const d = countdownDateInYear(rule, startYear + 1) ?? { date: today, adjusted: false };
  return { ...countdownResolveTarget(d.date, clock, zone), year: startYear + 1, adjusted: d.adjusted };
}

/** The occurrence just before `nowMs` (the previous year's), for a default progress start. */
export function countdownPreviousOccurrence(rule: CountdownYearlyRule, clock: CountdownClock, zone: string, nowMs: number): CountdownOccurrence {
  const next = countdownNextOccurrence(rule, clock, zone, nowMs);
  const d = countdownDateInYear(rule, next.year - 1) ?? { date: next.date, adjusted: false };
  return { ...countdownResolveTarget(d.date, clock, zone), year: next.year - 1, adjusted: d.adjusted };
}

// ---------------------------------------------------------------------------
// Presets computed from the calendars
// ---------------------------------------------------------------------------

export type CountdownPresetKey =
  | "ramadan"
  | "eidFitr"
  | "arafah"
  | "eidAdha"
  | "hijriNewYear"
  | "newYear"
  | "endOfMonth"
  | "saudiNationalDay";

export type CountdownPreset = {
  key: CountdownPresetKey;
  calendar: CountdownCalendar;
  /** Gregorian date of the next occurrence. */
  date: CivilDate;
  hijri: HijriDate;
  clock: CountdownClock;
  /** True for events whose official date depends on the sighting of the crescent moon. */
  moonSighting: boolean;
  /** Whether the event repeats every year (end of month does not). */
  yearly: boolean;
  rule: CountdownYearlyRule | null;
};

/** Islamic dates (Umm al-Qura): 1 Ramadan, 1 Shawwal, 9 and 10 Dhu al-Hijjah, 1 Muharram. */
export const COUNTDOWN_HIJRI_RULES: Record<"ramadan" | "eidFitr" | "arafah" | "eidAdha" | "hijriNewYear", CountdownYearlyRule> = {
  ramadan: { calendar: "hijri", month: 9, day: 1 },
  eidFitr: { calendar: "hijri", month: 10, day: 1 },
  arafah: { calendar: "hijri", month: 12, day: 9 },
  eidAdha: { calendar: "hijri", month: 12, day: 10 },
  hijriNewYear: { calendar: "hijri", month: 1, day: 1 },
};

export const COUNTDOWN_GREGORIAN_RULES: Record<"newYear" | "saudiNationalDay", CountdownYearlyRule> = {
  newYear: { calendar: "gregorian", month: 1, day: 1 },
  saudiNationalDay: { calendar: "gregorian", month: 9, day: 23 },
};

/**
 * Every preset's next occurrence after `nowMs` in `zone`, computed live from the Umm al-Qura and
 * Gregorian calendars. Event days start at 00:00 local; end of month is 23:59 on the last day.
 */
export function countdownPresets(nowMs: number, zone: string): CountdownPreset[] {
  const midnight: CountdownClock = { hour: 0, minute: 0 };
  const out: CountdownPreset[] = [];
  for (const key of ["ramadan", "eidFitr", "arafah", "eidAdha", "hijriNewYear"] as const) {
    const rule = COUNTDOWN_HIJRI_RULES[key];
    const occ = countdownNextOccurrence(rule, midnight, zone, nowMs);
    out.push({ key, calendar: "hijri", date: occ.date, hijri: gregorianToHijri(occ.date), clock: midnight, moonSighting: true, yearly: true, rule });
  }
  for (const key of ["newYear", "saudiNationalDay"] as const) {
    const rule = COUNTDOWN_GREGORIAN_RULES[key];
    const occ = countdownNextOccurrence(rule, midnight, zone, nowMs);
    out.push({ key, calendar: "gregorian", date: occ.date, hijri: gregorianToHijri(occ.date), clock: midnight, moonSighting: false, yearly: true, rule });
  }
  const today = countdownCivilInZone(nowMs, zone);
  const endClock: CountdownClock = { hour: 23, minute: 59 };
  let eom: CivilDate = { year: today.year, month: today.month, day: daysInMonth(today.year, today.month) };
  if (countdownResolveTarget(eom, endClock, zone).utcMs < nowMs) {
    const y = today.month === 12 ? today.year + 1 : today.year;
    const m = today.month === 12 ? 1 : today.month + 1;
    eom = { year: y, month: m, day: daysInMonth(y, m) };
  }
  out.push({ key: "endOfMonth", calendar: "gregorian", date: eom, hijri: gregorianToHijri(eom), clock: endClock, moonSighting: false, yearly: false, rule: null });
  return out.sort((a, b) => civilToUtcMs(a.date) - civilToUtcMs(b.date));
}

// ---------------------------------------------------------------------------
// Remaining time
// ---------------------------------------------------------------------------

export type CountdownBreakdown = {
  /** True once the target has passed (count-up). */
  isPast: boolean;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  weeks: number;
  /** Days left over after whole weeks. */
  weekDays: number;
};

export function countdownBreakdown(targetMs: number, nowMs: number): CountdownBreakdown {
  const diff = targetMs - nowMs;
  const totalSeconds = Math.floor(Math.abs(diff) / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  return {
    isPast: diff <= 0,
    totalSeconds,
    days,
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    weeks: Math.floor(days / 7),
    weekDays: days % 7,
  };
}

export type CountdownDayCount = BusinessDayCount & {
  /** First counted day (today in the event's zone). */
  from: CivilDate;
  /** Event day (not counted). */
  to: CivilDate;
};

/**
 * Calendar and business days from today (counted) up to the event day (not counted), both read
 * in the event's zone, split by the chosen weekend. Zero when the event day is today or past.
 */
export function countdownDaysLeft(nowMs: number, eventDate: CivilDate, zone: string, weekend: WeekendPreset): CountdownDayCount {
  const from = countdownCivilInZone(nowMs, zone);
  if (civilToUtcMs(eventDate) <= civilToUtcMs(from)) {
    return { from, to: eventDate, calendarDays: 0, businessDays: 0, weekendDays: 0, holidays: 0 };
  }
  return { from, to: eventDate, ...countBusinessDays(from, eventDate, weekend) };
}

/** Share of the wait elapsed between a start instant and the target (0…1, clamped). */
export function countdownProgress(startMs: number, targetMs: number, nowMs: number): number {
  if (!(targetMs > startMs)) return nowMs >= targetMs ? 1 : 0;
  return Math.min(1, Math.max(0, (nowMs - startMs) / (targetMs - startMs)));
}

export type CountdownMilestoneKey = "d100" | "d30" | "d7" | "d1" | "h1";
export type CountdownMilestone = { key: CountdownMilestoneKey; utcMs: number; passed: boolean };

const MILESTONES: [CountdownMilestoneKey, number][] = [
  ["d100", 100 * DAY_MS],
  ["d30", 30 * DAY_MS],
  ["d7", 7 * DAY_MS],
  ["d1", DAY_MS],
  ["h1", 3_600_000],
];

/** Fixed checkpoints before the event (100, 30, 7, 1 days and 1 hour out). */
export function countdownMilestones(targetMs: number, nowMs: number): CountdownMilestone[] {
  return MILESTONES.map(([key, before]) => ({ key, utcMs: targetMs - before, passed: nowMs >= targetMs - before }));
}

/** The next offset change (DST) of a zone between now and the target, if any. */
export function countdownDstChangeBefore(zone: string, nowMs: number, targetMs: number): { utcMs: number; offsetBefore: number; offsetAfter: number } | null {
  if (targetMs <= nowMs) return null;
  const y0 = utcMsToCivil(nowMs).year;
  const y1 = utcMsToCivil(targetMs).year;
  for (let y = y0; y <= Math.min(y1, y0 + 5); y++) {
    for (const tr of findOffsetTransitions(zone, y)) {
      if (tr.utcMs > nowMs && tr.utcMs <= targetMs) return tr;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// iCalendar (.ics)
// ---------------------------------------------------------------------------

export type CountdownIcsInput = {
  uid: string;
  title: string;
  description?: string;
  url?: string;
  /** Event start instant. */
  startUtcMs: number;
  durationMinutes: number;
  /** DTSTAMP (creation time) instant. */
  stampUtcMs: number;
  /** IANA zone of the event; required for a yearly event so it keeps its wall time across DST. */
  zone: string;
  /** Repeat yearly (Gregorian rule only; iCalendar has no Hijri recurrence). */
  yearly?: boolean;
  /** Reminder before the start, in minutes (omit for none). */
  alarmMinutesBefore?: number;
};

/** RFC 5545 §3.3.11 TEXT escaping. */
export function icsEscapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545 §3.1 folding: lines longer than 75 octets continue on a line starting with a space. */
function utf8Bytes(ch: string): number {
  const cp = ch.codePointAt(0) ?? 0;
  return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
}

export function icsFoldLine(line: string): string {
  let total = 0;
  for (const ch of line) total += utf8Bytes(ch);
  if (total <= 75) return line;
  const parts: string[] = [];
  let cur = "";
  let curBytes = 0;
  for (const ch of line) {
    const b = utf8Bytes(ch);
    const limit = parts.length === 0 ? 75 : 74;
    if (curBytes + b > limit) {
      parts.push(cur);
      cur = "";
      curBytes = 0;
    }
    cur += ch;
    curBytes += b;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

function icsUtc(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function icsLocal(p: { year: number; month: number; day: number; hour: number; minute: number; second: number }): string {
  return `${pad(p.year, 4)}${pad(p.month)}${pad(p.day)}T${pad(p.hour)}${pad(p.minute)}${pad(p.second)}`;
}

function icsOffset(min: number): string {
  const s = min < 0 ? "-" : "+";
  const a = Math.abs(min);
  return `${s}${pad(Math.floor(a / 60))}${pad(a % 60)}`;
}

const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/**
 * VTIMEZONE for a zone, built from its real transitions in `year` (via Intl). Each transition
 * becomes a yearly observance with an nth-weekday rule (e.g. 2SU in March, or -1SU for "last").
 */
export function icsTimezone(zone: string, year: number): string[] {
  const trs = findOffsetTransitions(zone, year);
  const lines = ["BEGIN:VTIMEZONE", `TZID:${zone}`];
  if (trs.length === 0) {
    const off = zoneOffsetMinutes(Date.UTC(year, 0, 1), zone);
    lines.push("BEGIN:STANDARD", `DTSTART:${pad(year, 4)}0101T000000`, `TZOFFSETFROM:${icsOffset(off)}`, `TZOFFSETTO:${icsOffset(off)}`, "END:STANDARD");
  } else {
    for (const tr of trs) {
      // Local wall time (in the offset before the change) at which the transition happens.
      const local = new Date(tr.utcMs + tr.offsetBefore * 60_000);
      const day = local.getUTCDate();
      const month = local.getUTCMonth() + 1;
      const dim = daysInMonth(local.getUTCFullYear(), month);
      const nth = day + 7 > dim ? -1 : Math.ceil(day / 7);
      const kind = tr.offsetAfter > tr.offsetBefore ? "DAYLIGHT" : "STANDARD";
      lines.push(
        `BEGIN:${kind}`,
        `DTSTART:${icsLocal({ year: local.getUTCFullYear(), month, day, hour: local.getUTCHours(), minute: local.getUTCMinutes(), second: 0 })}`,
        `RRULE:FREQ=YEARLY;BYMONTH=${month};BYDAY=${nth}${BYDAY[local.getUTCDay()]}`,
        `TZOFFSETFROM:${icsOffset(tr.offsetBefore)}`,
        `TZOFFSETTO:${icsOffset(tr.offsetAfter)}`,
        `END:${kind}`,
      );
    }
  }
  lines.push("END:VTIMEZONE");
  return lines;
}

/**
 * A complete VCALENDAR (CRLF line endings, folded, escaped). One-off events are written in UTC;
 * yearly events carry the zone (TZID + VTIMEZONE) so the wall time survives DST changes.
 */
export function buildCountdownIcs(input: CountdownIcsInput): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//TooloraLabs//Countdown to Event//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  const endMs = input.startUtcMs + Math.max(0, input.durationMinutes) * 60_000;
  const event: string[] = ["BEGIN:VEVENT", `UID:${input.uid}`, `DTSTAMP:${icsUtc(input.stampUtcMs)}`];
  if (input.yearly) {
    const sp = zonedParts(input.startUtcMs, input.zone);
    const ep = zonedParts(endMs, input.zone);
    lines.push(...icsTimezone(input.zone, sp.year - 1));
    event.push(`DTSTART;TZID=${input.zone}:${icsLocal(sp)}`, `DTEND;TZID=${input.zone}:${icsLocal(ep)}`, "RRULE:FREQ=YEARLY");
  } else {
    event.push(`DTSTART:${icsUtc(input.startUtcMs)}`, `DTEND:${icsUtc(endMs)}`);
  }
  event.push(`SUMMARY:${icsEscapeText(input.title)}`);
  if (input.description) event.push(`DESCRIPTION:${icsEscapeText(input.description)}`);
  if (input.url) event.push(`URL:${input.url}`);
  if (input.alarmMinutesBefore !== undefined && input.alarmMinutesBefore >= 0) {
    event.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEscapeText(input.title)}`, `TRIGGER:-PT${Math.round(input.alarmMinutesBefore)}M`, "END:VALARM");
  }
  event.push("END:VEVENT");
  lines.push(...event, "END:VCALENDAR");
  return lines.map(icsFoldLine).join("\r\n") + "\r\n";
}

/** File-name-safe slug for the .ics download. */
export function countdownIcsFileName(title: string, date: CivilDate): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .toLowerCase();
  return `${slug || "event"}-${formatIsoDate(date)}.ics`;
}
