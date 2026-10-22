"use client";
import { useEffect, useMemo, useState } from "react";
import { formatLocalizedNumber, parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import {
  addCivilDays,
  addDateSpan,
  calendarDiffYmd,
  computeDateSpan,
  countBusinessDays,
  defaultWeekendForLocale,
  diffCivilDays,
  formatIsoDate,
  gregorianToHijri,
  hijriFieldsToCivil,
  hijriToGregorian,
  parseCivilDate,
  type CivilDate,
  type DateAddReport,
  type DateSpanReport,
  type DateSpanUnit,
  type WeekendPreset,
} from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";

export type CalendarSystem = "gregorian" | "hijri";
export type DateMode = "difference" | "add";

/** One date input: Gregorian ISO is kept in sync with the Hijri day/month/year fields. */
export type DateField = { cal: CalendarSystem; iso: string; hy: string; hm: string; hd: string };

export type DateState = {
  mode: DateMode;
  start: DateField;
  end: DateField;
  op: "add" | "subtract";
  amount: string;
  unit: DateSpanUnit;
  includeEnd: boolean;
  weekend: WeekendPreset;
  holidays: string[];
};

export const UNITS: DateSpanUnit[] = ["days", "weeks", "months", "years", "businessDays"];
export const MAX_AMOUNT = 100_000;
const MIN_YEAR = 1600;
const MAX_YEAR = 2600;

export function fieldFromIso(iso: string, cal: CalendarSystem = "gregorian"): DateField {
  const c = parseCivilDate(iso);
  if (!c) return { cal, iso, hy: "", hm: "1", hd: "" };
  const h = gregorianToHijri(c);
  return { cal, iso, hy: String(h.year), hm: String(h.month), hd: String(h.day) };
}

export function fieldFromHijri(y: number, m: number, d: number): DateField {
  const g = hijriFieldsToCivil(y, m, d);
  return { cal: "hijri", iso: g ? formatIsoDate(g) : "", hy: String(y), hm: String(m), hd: String(d) };
}

/** Gregorian date of a field (from the Hijri fields when entered in Hijri), or null when invalid. */
export function fieldCivil(f: DateField): CivilDate | null {
  if (f.cal === "hijri") {
    return hijriFieldsToCivil(parseLocalizedNumber(f.hy), parseLocalizedNumber(f.hm), parseLocalizedNumber(f.hd));
  }
  return parseCivilDate(f.iso);
}

export function switchFieldCalendar(f: DateField, cal: CalendarSystem): DateField {
  if (cal === f.cal) return f;
  const c = fieldCivil(f);
  return c ? fieldFromIso(formatIsoDate(c), cal) : { ...f, cal };
}

/** Updates the Hijri fields of a field and re-derives its Gregorian ISO. */
export function patchHijri(f: DateField, patch: Partial<Pick<DateField, "hy" | "hm" | "hd">>): DateField {
  const next = { ...f, ...patch };
  const c = fieldCivil(next);
  return c ? { ...next, iso: formatIsoDate(c) } : next;
}

// ── Sample (instant result on load) ─────────────────────────────────────────────
/** Real public holidays inside the sample range: Eid al-Fitr 1447 (1–4 Shawwal) for Arabic, common spring holidays otherwise. */
function sampleHolidays(locale: string): string[] {
  if (locale.startsWith("ar")) {
    const out: string[] = [];
    for (let day = 1; day <= 4; day++) {
      const g = hijriToGregorian({ year: 1447, month: 10, day });
      if (g) out.push(formatIsoDate(g));
    }
    return out;
  }
  return ["2026-04-03", "2026-04-06", "2026-05-01", "2026-05-25"];
}

export function sampleState(locale: string): DateState {
  return {
    mode: "difference",
    start: fieldFromIso("2026-03-01"),
    end: fieldFromIso("2026-06-30"),
    op: "add",
    amount: "30",
    unit: "businessDays",
    includeEnd: true,
    weekend: defaultWeekendForLocale(locale),
    holidays: sampleHolidays(locale),
  };
}

export type DateScenario = { key: string; apply: (s: DateState) => DateState };

/** Quick examples, each showing one real edge of date arithmetic. */
export const DATE_PRO_SCENARIOS: DateScenario[] = [
  { key: "monthEnd", apply: (s) => ({ ...s, mode: "add", start: fieldFromIso("2026-01-31"), op: "add", amount: "1", unit: "months" }) },
  { key: "leap", apply: (s) => ({ ...s, mode: "add", start: fieldFromIso("2024-02-29"), op: "add", amount: "1", unit: "years" }) },
  { key: "invoice", apply: (s) => ({ ...s, mode: "add", start: fieldFromIso("2026-10-18"), op: "add", amount: "30", unit: "businessDays" }) },
  { key: "ramadan", apply: (s) => ({ ...s, mode: "difference", start: fieldFromHijri(1448, 9, 1), end: fieldFromHijri(1448, 10, 1), includeEnd: false }) },
  { key: "leapYear", apply: (s) => ({ ...s, mode: "difference", start: fieldFromIso("2028-01-01"), end: fieldFromIso("2028-12-31"), includeEnd: true }) },
];

// ── URL (share link) ─────────────────────────────────────────────────────────────
function fieldToParam(f: DateField): [string, string] {
  return f.cal === "hijri" ? ["h", `${f.hy}-${f.hm}-${f.hd}`] : ["", f.iso];
}

function fieldFromParam(g: string | null, h: string | null): DateField | null {
  if (h) {
    const [y, m, d] = h.split("-").map(Number);
    const f = fieldFromHijri(y, m, d);
    return f.iso ? f : null;
  }
  return g && parseCivilDate(g) ? fieldFromIso(g) : null;
}

export function stateToQuery(s: DateState): string {
  const p = new URLSearchParams();
  p.set("m", s.mode === "add" ? "add" : "diff");
  const [sk, sv] = fieldToParam(s.start);
  p.set(sk ? "sh" : "s", sv);
  if (s.mode === "difference") {
    const [ek, ev] = fieldToParam(s.end);
    p.set(ek ? "eh" : "e", ev);
    if (s.includeEnd) p.set("inc", "1");
  } else {
    p.set("op", s.op);
    p.set("n", s.amount);
    p.set("u", s.unit);
  }
  p.set("wk", s.weekend);
  if (s.holidays.length) p.set("hol", s.holidays.join(","));
  return p.toString();
}

export function stateFromQuery(search: string, locale: string): DateState | null {
  const p = new URLSearchParams(search);
  const start = fieldFromParam(p.get("s"), p.get("sh"));
  if (!start) return null;
  const base = sampleState(locale);
  const mode: DateMode = p.get("m") === "add" ? "add" : "difference";
  const end = fieldFromParam(p.get("e"), p.get("eh")) ?? base.end;
  const unit = p.get("u") as DateSpanUnit | null;
  const wk = p.get("wk");
  const hol = (p.get("hol") ?? "").split(",").filter((x) => parseCivilDate(x));
  return {
    mode,
    start,
    end,
    op: p.get("op") === "subtract" ? "subtract" : "add",
    amount: p.get("n") ?? base.amount,
    unit: unit && UNITS.includes(unit) ? unit : base.unit,
    includeEnd: p.get("inc") === "1",
    weekend: wk === "fri-sat" || wk === "sat-sun" ? wk : base.weekend,
    holidays: p.has("hol") ? [...new Set(hol)].sort() : [],
  };
}

/** State seeded from the sample, then from the share link once on mount; kept in the URL afterwards. */
export function useDateState(locale: string) {
  const [state, setState] = useState<DateState>(() => sampleState(locale));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fromUrl = stateFromQuery(window.location.search, locale);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of a shared link
    if (fromUrl) setState(fromUrl);
    setReady(true);
  }, [locale]);

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

// ── Derived result ───────────────────────────────────────────────────────────────
export type DateError = "" | "startInvalid" | "endInvalid" | "amountInvalid" | "outOfRange";

const inRange = (c: CivilDate) => c.year >= MIN_YEAR && c.year <= MAX_YEAR;

function compute(state: DateState, start: CivilDate, end: CivilDate, amount: number) {
  const add: DateAddReport | null =
    state.mode === "add"
      ? addDateSpan({ start, amount, unit: state.unit, operation: state.op, weekend: state.weekend, holidays: state.holidays })
      : null;
  const target = add ? add.result : end;
  const span: DateSpanReport = computeDateSpan({
    start,
    end: target,
    includeEnd: state.mode === "difference" && state.includeEnd,
    weekend: state.weekend,
    holidays: state.holidays,
  });
  return { start, target, add, span };
}

export function derive(state: DateState) {
  let error: DateError = "";
  const start = fieldCivil(state.start);
  const end = fieldCivil(state.end);
  const amount = parseLocalizedNumber(state.amount);
  if (!start) error = "startInvalid";
  else if (state.mode === "difference" && !end) error = "endInvalid";
  else if (state.mode === "add" && (!Number.isInteger(amount) || amount < 0 || amount > MAX_AMOUNT)) error = "amountInvalid";
  else if (!inRange(start) || (state.mode === "difference" && !inRange(end!))) error = "outOfRange";
  let r = error ? null : compute(state, start!, end ?? start!, amount);
  if (r && !inRange(r.target)) {
    error = "outOfRange";
    r = null;
  }
  // An invalid entry keeps the page showing a real result (the sample range) next to the message.
  if (!r) {
    const s = sampleState("en");
    r = compute({ ...state, mode: "difference", includeEnd: true }, fieldCivil(s.start)!, fieldCivil(s.end)!, 0);
  }
  return { ...r, error, mode: error ? ("difference" as DateMode) : state.mode, weekend: state.weekend, holidays: state.holidays };
}

export type Derived = ReturnType<typeof derive>;

export function useDerived(state: DateState): Derived {
  return useMemo(() => derive(state), [state]);
}

/**
 * Drag on the timeline: moves the end of the span to `iso`. In difference mode it sets the end
 * date; in add mode it converts the new span into the selected unit (and direction).
 */
export function withSpanEnd(state: DateState, start: CivilDate, target: CivilDate): DateState {
  if (state.mode === "difference") return { ...state, end: fieldFromIso(formatIsoDate(target), state.end.cal) };
  const days = diffCivilDays(start, target);
  const op = days < 0 ? "subtract" : "add";
  const abs = Math.abs(days);
  let amount: number;
  if (state.unit === "days") amount = abs;
  else if (state.unit === "weeks") amount = Math.round(abs / 7);
  else if (state.unit === "businessDays") {
    // Same convention as addBusinessDays: the start day is not counted, the landing day is.
    amount =
      days >= 0
        ? countBusinessDays(addCivilDays(start, 1), addCivilDays(target, 1), state.weekend, state.holidays).businessDays
        : countBusinessDays(target, start, state.weekend, state.holidays).businessDays;
  } else {
    const ymd = calendarDiffYmd(start, target);
    const months = ymd.years * 12 + ymd.months + (ymd.days >= 15 ? 1 : 0);
    amount = state.unit === "years" ? Math.round(months / 12) : months;
  }
  return { ...state, op, amount: String(amount) };
}

// ── Formatting ───────────────────────────────────────────────────────────────────
export function stateDigitStyle(state: DateState): DigitStyle {
  return resolveDigitStyle(state.amount, state.start.hy, state.start.hd, state.end.hy, state.end.hd);
}

export function makeFormatters(locale: string, digitStyle: DigitStyle) {
  const nu = digitStyle === "eastern" ? "arab" : "latn";
  const opts = { timeZone: "UTC" } as const;
  const greg = new Intl.DateTimeFormat(`${locale}-u-ca-gregory-nu-${nu}`, { ...opts, day: "numeric", month: "short", year: "numeric" });
  const gregLong = new Intl.DateTimeFormat(`${locale}-u-ca-gregory-nu-${nu}`, { ...opts, weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hij = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-${nu}`, { ...opts, day: "numeric", month: "short", year: "numeric" });
  const hijLong = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-${nu}`, { ...opts, day: "numeric", month: "long", year: "numeric" });
  const hijMonth = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-${nu}`, { ...opts, month: "long" });
  const gMonth = new Intl.DateTimeFormat(`${locale}-u-ca-gregory-nu-${nu}`, { ...opts, month: "short" });
  const gMonthYear = new Intl.DateTimeFormat(`${locale}-u-ca-gregory-nu-${nu}`, { ...opts, month: "long", year: "numeric" });
  const wd = new Intl.DateTimeFormat(`${locale}-u-nu-${nu}`, { ...opts, weekday: "long" });
  const wdShort = new Intl.DateTimeFormat(`${locale}-u-nu-${nu}`, { ...opts, weekday: "short" });
  const toDate = (c: CivilDate) => new Date(Date.UTC(c.year, c.month - 1, c.day));
  // 2023-01-01 was a Sunday: weekday index 0 … 6.
  const weekdayDate = (i: number) => new Date(Date.UTC(2023, 0, 1 + i));
  return {
    int: (v: number) => formatLocalizedNumber(v, digitStyle, { maximumFractionDigits: 0 }),
    num: (v: number, digits = 2) => formatLocalizedNumber(v, digitStyle, { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    pct: (v: number) => `${formatLocalizedNumber(v * 100, digitStyle, { maximumFractionDigits: 1 })}%`,
    greg: (c: CivilDate) => greg.format(toDate(c)),
    gregLong: (c: CivilDate) => gregLong.format(toDate(c)),
    hijri: (c: CivilDate) => hij.format(toDate(c)),
    hijriLong: (c: CivilDate) => hijLong.format(toDate(c)),
    iso: (c: CivilDate) => formatIsoDate(c),
    monthShort: (m: number) => gMonth.format(new Date(Date.UTC(2026, m - 1, 1))),
    monthYear: (c: CivilDate) => gMonthYear.format(toDate(c)),
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

/** Category colours shared by the result drawing and the indicators (theme-neutral hues). */
export const DATE_COLORS = {
  business: "#2563eb",
  weekend: "#94a3b8",
  holiday: "#f59e0b",
  hijri: "#059669",
  leap: "#db2777",
  danger: "#dc2626",
};

export const isWeekendDay = (weekend: WeekendPreset, dow: number) => (weekend === "fri-sat" ? dow === 5 || dow === 6 : dow === 6 || dow === 0);
