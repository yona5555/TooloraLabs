/**
 * World Time Converter logic on top of DateTimeCore: convert one wall time to many zones (DST
 * gap/overlap flagged by zonedToUtc), per-city local readings with Hijri dates, upcoming offset
 * transitions, and a meeting planner that respects work hours and each city's weekend.
 * All zone math goes through Intl via DateTimeCore; no hardcoded offsets, no DOM.
 */
import {
  civilToUtcMs,
  civilWeekday,
  findOffsetTransitions,
  gregorianToHijri,
  isDstActive,
  zonedParts,
  zonedToUtc,
  zoneOffsetMinutes,
  type CivilDate,
  type DstTransition,
  type HijriDate,
  type ZonedParts,
} from "./DateTimeCore";

const DAY_MS = 86_400_000;
const MIN_MS = 60_000;

export type WtCityTime = {
  zone: string;
  utcMs: number;
  parts: ZonedParts;
  offsetMinutes: number;
  dst: boolean;
  /** 0 = Sunday … 6 = Saturday, of the local date. */
  weekday: number;
  /** Local calendar day minus the reference zone's calendar day (−1, 0, +1, rarely ±2). */
  dayDelta: number;
  hijri: HijriDate;
};

function dayNumber(p: CivilDate): number {
  return Math.round(civilToUtcMs(p) / DAY_MS);
}

/** Local reading of one instant in a zone, relative to a reference zone's calendar day. */
export function wtCityTime(utcMs: number, zone: string, refZone: string = zone): WtCityTime {
  const parts = zonedParts(utcMs, zone);
  const ref = refZone === zone ? parts : zonedParts(utcMs, refZone);
  const date = { year: parts.year, month: parts.month, day: parts.day };
  return {
    zone,
    utcMs,
    parts,
    offsetMinutes: zoneOffsetMinutes(utcMs, zone),
    dst: isDstActive(utcMs, zone),
    weekday: civilWeekday(date),
    dayDelta: dayNumber(parts) - dayNumber(ref),
    hijri: gregorianToHijri(date),
  };
}

export type WtConversion = {
  fromZone: string;
  /** The wall time as entered. */
  input: ZonedParts;
  /** The wall time actually used (differs from `input` only in a DST gap). */
  resolved: ZonedParts;
  status: "ok" | "gap" | "overlap";
  utcMs: number;
  /** Overlap only: the later of the two instants that read the same wall time. */
  laterUtcMs: number | null;
  /** Gap only: how many minutes the clocks jumped (usually 60). */
  gapMinutes: number;
  rows: WtCityTime[];
};

/** Converts a wall-clock time in `fromZone` to every zone in `zones` (DST gap/overlap aware). */
export function wtConvertWallTime(input: ZonedParts, fromZone: string, zones: readonly string[]): WtConversion {
  const res = zonedToUtc(input, fromZone);
  const wall = Date.UTC(input.year, input.month - 1, input.day, input.hour, input.minute, input.second);
  let laterUtcMs: number | null = null;
  let gapMinutes = 0;
  if (res.status === "overlap") {
    const alt = wall - zoneOffsetMinutes(res.utcMs + 6 * 3_600_000, fromZone) * MIN_MS;
    laterUtcMs = alt > res.utcMs ? alt : null;
  } else if (res.status === "gap") {
    gapMinutes = zoneOffsetMinutes(wall + DAY_MS, fromZone) - zoneOffsetMinutes(wall - DAY_MS, fromZone);
  }
  return {
    fromZone,
    input,
    resolved: zonedParts(res.utcMs, fromZone),
    status: res.status,
    utcMs: res.utcMs,
    laterUtcMs,
    gapMinutes,
    rows: zones.map((z) => wtCityTime(res.utcMs, z, fromZone)),
  };
}

/** Offset transitions of a zone in (fromUtcMs, untilUtcMs], oldest first. */
export function wtTransitionsBetween(zone: string, fromUtcMs: number, untilUtcMs: number): DstTransition[] {
  const y0 = new Date(fromUtcMs).getUTCFullYear();
  const y1 = new Date(untilUtcMs).getUTCFullYear();
  const out: DstTransition[] = [];
  for (let y = y0; y <= y1; y++) {
    for (const t of findOffsetTransitions(zone, y)) if (t.utcMs > fromUtcMs && t.utcMs <= untilUtcMs) out.push(t);
  }
  return out;
}

/** The next offset transition after `fromUtcMs` within two years, or null for zones without DST. */
export function wtNextTransition(zone: string, fromUtcMs: number): DstTransition | null {
  return wtTransitionsBetween(zone, fromUtcMs, fromUtcMs + 2 * 366 * DAY_MS)[0] ?? null;
}

/** Standard (winter) offset and DST saving of a zone in a year, from its January/July offsets. */
export function wtStandardOffset(zone: string, year: number): { standard: number; saving: number } {
  const jan = zoneOffsetMinutes(Date.UTC(year, 0, 1), zone);
  const jul = zoneOffsetMinutes(Date.UTC(year, 6, 1), zone);
  return { standard: Math.min(jan, jul), saving: Math.abs(jul - jan) };
}

// ---------------------------------------------------------------------------
// Meeting planner
// ---------------------------------------------------------------------------

export type WtSlotStatus = "work" | "shoulder" | "night" | "weekend";

export type WtMeetingCity = { zone: string; weekend: readonly number[] };

export type WtMeetingSlot = {
  utcMs: number;
  statuses: WtSlotStatus[];
  /** Local minute of day per city. */
  localMinutes: number[];
  /** Number of cities inside work hours on a workday. */
  available: number;
  /** work = 2, shoulder (07:00–22:00 outside work) = 1, night/weekend = 0, summed over cities. */
  score: number;
};

export type WtMeetingPlan = {
  stepMinutes: number;
  slots: WtMeetingSlot[];
  maxAvailable: number;
  /** Indices of the slots with the most cities available, best comfort score first. */
  bestSlots: number[];
  /** Longest contiguous run of slots that reach `maxAvailable` (inclusive indices), or null. */
  bestWindow: { start: number; end: number } | null;
  /** Minutes in the day when every city is inside work hours on a workday. */
  allOverlapMinutes: number;
};

const SHOULDER_START = 7 * 60;
const SHOULDER_END = 22 * 60;

export function wtSlotStatus(localMinute: number, weekday: number, city: WtMeetingCity, workStart: number, workEnd: number, step: number): WtSlotStatus {
  if (city.weekend.includes(weekday)) return "weekend";
  if (localMinute >= workStart && localMinute + step <= workEnd) return "work";
  if (localMinute >= SHOULDER_START && localMinute < SHOULDER_END) return "shoulder";
  return "night";
}

/**
 * Slots across the reference zone's calendar `date` (23/25 hours on DST days) with each city's
 * status. `workStart`/`workEnd` are local minutes of day (e.g. 540 and 1020 for 09:00–17:00).
 */
export function wtPlanMeeting(
  cities: readonly WtMeetingCity[],
  refZone: string,
  date: CivilDate,
  workStart: number,
  workEnd: number,
  stepMinutes = 30,
): WtMeetingPlan {
  const ws = Math.max(0, Math.min(workStart, 1440));
  const we = Math.max(ws + stepMinutes, Math.min(workEnd, 1440));
  const start = zonedToUtc({ ...date, hour: 0, minute: 0, second: 0 }, refZone).utcMs;
  const next = new Date(civilToUtcMs(date) + DAY_MS);
  const end = zonedToUtc({ year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate(), hour: 0, minute: 0, second: 0 }, refZone).utcMs;

  const slots: WtMeetingSlot[] = [];
  for (let t = start; t < end; t += stepMinutes * MIN_MS) {
    const statuses: WtSlotStatus[] = [];
    const localMinutes: number[] = [];
    for (const c of cities) {
      const p = zonedParts(t, c.zone);
      const m = p.hour * 60 + p.minute;
      localMinutes.push(m);
      statuses.push(wtSlotStatus(m, civilWeekday(p), c, ws, we, stepMinutes));
    }
    const available = statuses.filter((s) => s === "work").length;
    const score = statuses.reduce((s, st) => s + (st === "work" ? 2 : st === "shoulder" ? 1 : 0), 0);
    slots.push({ utcMs: t, statuses, localMinutes, available, score });
  }

  const maxAvailable = slots.reduce((m, s) => Math.max(m, s.available), 0);
  const bestSlots =
    maxAvailable === 0
      ? []
      : slots
          .map((s, i) => ({ s, i }))
          .filter(({ s }) => s.available === maxAvailable)
          .sort((a, b) => b.s.score - a.s.score || a.i - b.i)
          .map(({ i }) => i);

  let bestWindow: WtMeetingPlan["bestWindow"] = null;
  if (maxAvailable > 0) {
    let runStart = -1;
    for (let i = 0; i <= slots.length; i++) {
      const hit = i < slots.length && slots[i].available === maxAvailable;
      if (hit && runStart < 0) runStart = i;
      if (!hit && runStart >= 0) {
        if (!bestWindow || i - 1 - runStart > bestWindow.end - bestWindow.start) bestWindow = { start: runStart, end: i - 1 };
        runStart = -1;
      }
    }
  }

  const allOverlapMinutes = cities.length === 0 ? 0 : slots.filter((s) => s.available === cities.length).length * stepMinutes;
  return { stepMinutes, slots, maxAvailable, bestSlots, bestWindow, allOverlapMinutes };
}

/** Minutes in the plan when both city `i` and city `j` are inside work hours on a workday. */
export function wtPairOverlapMinutes(plan: WtMeetingPlan, i: number, j: number): number {
  return plan.slots.filter((s) => s.statuses[i] === "work" && s.statuses[j] === "work").length * plan.stepMinutes;
}

/** Weekdays (0–6) that are workdays in every one of the given weekends. */
export function wtSharedWorkdays(weekends: readonly (readonly number[])[]): number[] {
  return [0, 1, 2, 3, 4, 5, 6].filter((d) => weekends.every((w) => !w.includes(d)));
}
