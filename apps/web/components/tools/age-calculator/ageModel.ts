"use client";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  computeDualAge,
  computeLifeExpectancyProgress,
  formatIsoDate,
  gregorianToHijri,
  hijriToGregorian,
  parseCivilDate,
  upcomingAgeEvents,
  validateAgeInput,
  type CivilDate,
  type DualAgeReport,
  type Gender,
  type LeapDayRule,
} from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import { subscribeVisibleClock } from "@/components/tool-ui/motion/motion";

export type CalendarSystem = "gregorian" | "hijri";

export type AgeState = {
  cal: CalendarSystem;
  /** Gregorian birth date (ISO), the source of truth when cal = gregorian. */
  birth: string;
  hy: string;
  hm: string;
  hd: string;
  useRef: boolean;
  ref: string;
  leap: LeapDayRule;
  sex: Gender;
};

export const SAMPLE_BIRTH = "1994-06-15";
/** Server render / first paint reference, replaced by the visitor's real "today" right after hydration. */
const FALLBACK_TODAY = "2026-10-17";

export type AgeScenario = { key: string; birth: string; ref?: string; leap?: LeapDayRule };

/** Real dates that each show a different edge of the calculation. */
export const AGE_SCENARIOS: AgeScenario[] = [
  { key: "millennial", birth: "1994-06-15" },
  { key: "leapling", birth: "2000-02-29", ref: "2027-02-28", leap: "feb28" },
  { key: "ramadan", birth: "2024-03-11", ref: "2025-03-01" },
  { key: "boomer", birth: "1958-08-09" },
];

function hijriFieldsFor(iso: string) {
  const c = parseCivilDate(iso);
  if (!c) return { hy: "", hm: "1", hd: "" };
  const h = gregorianToHijri(c);
  return { hy: String(h.year), hm: String(h.month), hd: String(h.day) };
}

export function sampleState(): AgeState {
  return { cal: "gregorian", birth: SAMPLE_BIRTH, ...hijriFieldsFor(SAMPLE_BIRTH), useRef: false, ref: "", leap: "feb28", sex: "male" };
}

export function withBirth(state: AgeState, iso: string): AgeState {
  return { ...state, birth: iso, ...hijriFieldsFor(iso) };
}

export function switchCalendar(state: AgeState, cal: CalendarSystem): AgeState {
  if (cal === state.cal) return state;
  if (cal === "hijri") return { ...state, cal, ...hijriFieldsFor(state.birth) };
  const g = hijriBirth(state);
  return { ...state, cal, birth: g ? formatIsoDate(g) : state.birth };
}

function hijriBirth(state: AgeState): CivilDate | null {
  const y = parseLocalizedNumber(state.hy);
  const m = parseLocalizedNumber(state.hm);
  const d = parseLocalizedNumber(state.hd);
  if (![y, m, d].every(Number.isInteger) || y < 1300 || y > 1600) return null;
  return hijriToGregorian({ year: y, month: m, day: d });
}

// ── URL (share link) ─────────────────────────────────────────────────────────────
export function stateToQuery(state: AgeState): string {
  const p = new URLSearchParams();
  if (state.cal === "hijri") {
    p.set("cal", "hijri");
    p.set("h", `${state.hy}-${state.hm}-${state.hd}`);
  } else {
    p.set("b", state.birth);
  }
  if (state.useRef && state.ref) p.set("ref", state.ref);
  if (state.leap !== "feb28") p.set("leap", state.leap);
  if (state.sex !== "male") p.set("sex", state.sex);
  return p.toString();
}

export function stateFromQuery(search: string): AgeState | null {
  const p = new URLSearchParams(search);
  const b = p.get("b");
  const h = p.get("h");
  if (!b && !h) return null;
  let next = sampleState();
  if (h && p.get("cal") === "hijri") {
    const [hy = "", hm = "1", hd = ""] = h.split("-");
    next = { ...next, cal: "hijri", hy, hm, hd };
    const g = hijriBirth(next);
    if (g) next.birth = formatIsoDate(g);
  } else if (b && parseCivilDate(b)) {
    next = withBirth(next, b);
  }
  const ref = p.get("ref");
  if (ref && parseCivilDate(ref)) next = { ...next, useRef: true, ref };
  if (p.get("leap") === "mar1") next.leap = "mar1";
  if (p.get("sex") === "female") next.sex = "female";
  return next;
}

/** State seeded from the sample, then from the share link (?b=…) once on mount; kept in the URL. */
export function useAgeState() {
  const [state, setState] = useState<AgeState>(sampleState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fromUrl = stateFromQuery(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of a shared link
    if (fromUrl) setState(fromUrl);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.history.replaceState(null, "", `${window.location.pathname}?${stateToQuery(state)}`);
    } catch {
      /* history API unavailable: the share link just won't carry the inputs */
    }
  }, [state, ready]);

  return [state, setState, ready] as const;
}

// ── Today (client clock, stable snapshot) ────────────────────────────────────────
let cachedToday = "";
function localTodayIso(): string {
  const n = new Date();
  return formatIsoDate({ year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() });
}
function subscribeToday(cb: () => void) {
  const tick = () => {
    const next = localTodayIso();
    if (next !== cachedToday) {
      cachedToday = next;
      cb();
    }
  };
  tick();
  return subscribeVisibleClock(60_000, tick); // tool-ui/motion: nothing while the page is hidden
}
export function useTodayIso(): string {
  return useSyncExternalStore(
    subscribeToday,
    () => cachedToday || FALLBACK_TODAY,
    () => FALLBACK_TODAY,
  );
}

// ── Derived result ───────────────────────────────────────────────────────────────
export type AgeError = "" | "birthInvalid" | "hijriInvalid" | "refInvalid" | "referenceBeforeBirth" | "outOfRange";

export function derive(state: AgeState, todayIso: string) {
  const today = parseCivilDate(todayIso) ?? parseCivilDate(FALLBACK_TODAY)!;
  let error: AgeError = "";
  const birth = state.cal === "hijri" ? hijriBirth(state) : parseCivilDate(state.birth);
  if (!birth) error = state.cal === "hijri" ? "hijriInvalid" : "birthInvalid";
  const reference = state.useRef ? parseCivilDate(state.ref) : today;
  if (!error && !reference) error = "refInvalid";
  if (!error) {
    const v = validateAgeInput(birth!, reference!);
    if (v !== "ok") error = v;
  }
  // An invalid entry keeps the page showing a real result (the sample) next to the message.
  const b = error ? parseCivilDate(SAMPLE_BIRTH)! : birth!;
  const r = error ? today : reference!;
  const report: DualAgeReport = computeDualAge(b, r, state.leap);
  const events = upcomingAgeEvents(report);
  const life = computeLifeExpectancyProgress(report.gregorian.decimalYears, state.sex);
  return { report, events, life, error, today, isToday: !state.useRef || formatIsoDate(r) === formatIsoDate(today) };
}

export type Derived = ReturnType<typeof derive>;

export function useDerived(state: AgeState, todayIso: string): Derived {
  return useMemo(() => derive(state, todayIso), [state, todayIso]);
}

// ── Formatting ───────────────────────────────────────────────────────────────────
export function stateDigitStyle(state: AgeState): DigitStyle {
  return resolveDigitStyle(state.hy, state.hd);
}

export function makeFormatters(locale: string, digitStyle: DigitStyle) {
  const nu = digitStyle === "eastern" ? "arab" : "latn";
  const greg = new Intl.DateTimeFormat(`${locale}-u-ca-gregory-nu-${nu}`, { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
  const hij = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-${nu}`, { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
  const hijMonth = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-${nu}`, { timeZone: "UTC", month: "long" });
  const wd = new Intl.DateTimeFormat(`${locale}-u-nu-${nu}`, { timeZone: "UTC", weekday: "long" });
  const wdShort = new Intl.DateTimeFormat(`${locale}-u-nu-${nu}`, { timeZone: "UTC", weekday: "short" });
  const toDate = (c: CivilDate) => new Date(Date.UTC(c.year, c.month - 1, c.day));
  // 2023-01-01 was a Sunday: weekday index 0 … 6.
  const weekdayDate = (i: number) => new Date(Date.UTC(2023, 0, 1 + i));
  return {
    int: (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 0 }),
    num: (v: number, digits = 2) => formatLocalizedNumber(v, digitStyle, { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    pct: (v: number) => `${formatLocalizedNumber(v * 100, digitStyle, { maximumFractionDigits: 1 })}%`,
    greg: (c: CivilDate) => greg.format(toDate(c)),
    hijri: (c: CivilDate) => hij.format(toDate(c)),
    iso: (c: CivilDate) => formatIsoDate(c),
    weekday: (i: number) => wd.format(weekdayDate(i)),
    weekdayShort: (i: number) => wdShort.format(weekdayDate(i)),
    /** Hijri month name (1-12), read from a date inside 1447 AH. */
    hijriMonth: (m: number) => {
      const g = hijriToGregorian({ year: 1447, month: m, day: 15 });
      return g ? hijMonth.format(toDate(g)) : String(m);
    },
  };
}

export type Formatters = ReturnType<typeof makeFormatters>;

/** Category colours shared by the result dial and the indicators (theme-neutral hues). */
export const AGE_COLORS = { gregorian: "#2563eb", hijri: "#059669", accent: "#f59e0b", muted: "#94a3b8", danger: "#dc2626" };
