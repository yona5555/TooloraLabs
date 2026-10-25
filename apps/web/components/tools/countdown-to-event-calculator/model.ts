"use client";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { formatLocalizedNumber, parseLocalizedNumber } from "@tooloralabs/core";
import {
  civilToUtcMs,
  countdownBreakdown,
  countdownCivilInZone,
  countdownDaysLeft,
  countdownDstChangeBefore,
  countdownMilestones,
  countdownNextOccurrence,
  countdownPresets,
  countdownPreviousOccurrence,
  countdownProgress,
  countdownResolveTarget,
  defaultWeekendForLocale,
  formatIsoDate,
  formatOffset,
  gregorianToHijri,
  hijriFieldsToCivil,
  isValidIanaZone,
  parseCivilDate,
  weekdayCountsInRange,
  WT_CITIES,
  zoneOffsetMinutes,
  type CivilDate,
  type CountdownClock,
  type CountdownLeapRule,
  type CountdownPreset,
  type CountdownPresetKey,
  type CountdownYearlyRule,
  type WeekendPreset,
} from "@tooloralabs/tools";

export type CdCalendar = "gregorian" | "hijri";

export type CdState = {
  title: string;
  cal: CdCalendar;
  /** Gregorian YYYY-MM-DD (kept in sync with the Hijri fields). */
  date: string;
  hy: string;
  hm: string;
  hd: string;
  /** HH:MM wall time in `zone`. */
  time: string;
  zone: string;
  yearly: boolean;
  leap: CountdownLeapRule;
  /** Progress start, YYYY-MM-DD at 00:00 in `zone`. */
  start: string;
  weekend: WeekendPreset;
  /** The preset the event came from, for the moon-sighting note. */
  preset: CountdownPresetKey | null;
};

export type SavedCountdown = CdState & { id: string };

export const STORAGE_KEY = "tooloralabs:countdowns:v1";
const DAY_MS = 86_400_000;
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseClock(time: string): CountdownClock {
  const m = HHMM.exec(time);
  return m ? { hour: Number(m[1]), minute: Number(m[2]) } : { hour: 0, minute: 0 };
}

const clockText = (c: CountdownClock) => `${String(c.hour).padStart(2, "0")}:${String(c.minute).padStart(2, "0")}`;

export function withHijriFromIso(s: CdState, iso: string): CdState {
  const c = parseCivilDate(iso);
  if (!c) return { ...s, date: iso };
  const h = gregorianToHijri(c);
  return { ...s, date: iso, hy: String(h.year), hm: String(h.month), hd: String(h.day) };
}

export function withHijriFields(s: CdState, patch: Partial<Pick<CdState, "hy" | "hm" | "hd">>): CdState {
  const next = { ...s, ...patch };
  const c = hijriFieldsToCivil(parseLocalizedNumber(next.hy), parseLocalizedNumber(next.hm), parseLocalizedNumber(next.hd));
  return c ? { ...next, date: formatIsoDate(c) } : next;
}

/** Applies a calendar preset (dates computed live by the package from Umm al-Qura / Gregorian). */
export function applyPreset(s: CdState, p: CountdownPreset, title: string, nowMs: number): CdState {
  const base = withHijriFromIso({ ...s, title, cal: p.calendar, time: clockText(p.clock), yearly: p.yearly, preset: p.key }, formatIsoDate(p.date));
  const start = p.rule ? countdownPreviousOccurrence(p.rule, p.clock, s.zone, nowMs).date : countdownCivilInZone(nowMs, s.zone);
  const startIso = p.key === "endOfMonth" ? formatIsoDate({ ...p.date, day: 1 }) : formatIsoDate(start);
  return { ...base, start: startIso };
}

/** Instant sample on load: Ramadan for Arabic (Riyadh), New Year elsewhere (visitor's zone). */
export function sampleState(locale: string, nowMs: number, zone: string, titleFor: (k: CountdownPresetKey) => string): CdState {
  const isAr = locale.startsWith("ar");
  const z = isAr ? "Asia/Riyadh" : zone;
  const empty: CdState = {
    title: "",
    cal: "gregorian",
    date: "",
    hy: "",
    hm: "1",
    hd: "",
    time: "00:00",
    zone: z,
    yearly: true,
    leap: "feb28",
    start: "",
    weekend: defaultWeekendForLocale(locale),
    preset: null,
  };
  const key: CountdownPresetKey = isAr ? "ramadan" : "newYear";
  const p = countdownPresets(nowMs, z).find((x) => x.key === key)!;
  return applyPreset(empty, p, titleFor(key), nowMs);
}

// ── URL (share link) ─────────────────────────────────────────────────────────────

export function stateToQuery(s: CdState): string {
  const p = new URLSearchParams();
  if (s.title) p.set("t", s.title);
  if (s.cal === "hijri") p.set("h", `${s.hy}-${s.hm}-${s.hd}`);
  else p.set("d", s.date);
  p.set("tm", s.time);
  p.set("z", s.zone);
  if (s.yearly) p.set("y", "1");
  if (s.leap === "mar1") p.set("lp", "mar1");
  if (s.start) p.set("s", s.start);
  p.set("wk", s.weekend);
  if (s.preset) p.set("p", s.preset);
  return p.toString();
}

const PRESET_KEYS: CountdownPresetKey[] = ["ramadan", "eidFitr", "arafah", "eidAdha", "hijriNewYear", "newYear", "endOfMonth", "saudiNationalDay"];

export function stateFromQuery(search: string, base: CdState): CdState | null {
  const p = new URLSearchParams(search);
  const d = p.get("d");
  const h = p.get("h");
  if (!d && !h) return null;
  let s: CdState = { ...base, title: (p.get("t") ?? "").slice(0, 80), preset: null };
  if (h) {
    const [hy, hm, hd] = h.split("-");
    s = withHijriFields({ ...s, cal: "hijri" }, { hy, hm, hd });
    if (!hijriFieldsToCivil(Number(hy), Number(hm), Number(hd))) return null;
  } else if (d && parseCivilDate(d)) {
    s = withHijriFromIso({ ...s, cal: "gregorian" }, d);
  } else return null;
  const tm = p.get("tm");
  const z = p.get("z");
  const wk = p.get("wk");
  const st = p.get("s");
  const pr = p.get("p") as CountdownPresetKey | null;
  return {
    ...s,
    time: tm && HHMM.test(tm) ? tm : "00:00",
    zone: z && isValidIanaZone(z) ? z : base.zone,
    yearly: p.get("y") === "1",
    leap: p.get("lp") === "mar1" ? "mar1" : "feb28",
    start: st && parseCivilDate(st) ? st : "",
    weekend: wk === "fri-sat" || wk === "sat-sun" ? wk : base.weekend,
    preset: pr && PRESET_KEYS.includes(pr) ? pr : null,
  };
}

// ── Clock and viewer zone ──────────────────────────────────────────────────────────

let cachedNow = 0;
/** Stable server/hydration reference so the first paint is a real countdown, then the live clock takes over. */
export const FALLBACK_NOW = Date.UTC(2026, 9, 17, 9, 0, 0);

function subscribeClock(cb: () => void) {
  const tick = () => {
    cachedNow = Date.now();
    cb();
  };
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}

/** Live "now", once per second (useSyncExternalStore: no setState in effects, no hydration tear). */
export function useNow(): number {
  const now = useSyncExternalStore(subscribeClock, () => cachedNow, () => 0);
  return now || FALLBACK_NOW;
}

const noopSubscribe = () => () => {};
function readViewerZone(): string {
  try {
    const z = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return z && isValidIanaZone(z) ? z : "UTC";
  } catch {
    return "UTC";
  }
}

export function useViewerZone(): string {
  return useSyncExternalStore(noopSubscribe, readViewerZone, () => "UTC");
}

/** State: sample first, then the share link (or a fresh sample at the real clock) once on mount; mirrored to the URL. */
export function useCountdownState(locale: string, titleFor: (k: CountdownPresetKey) => string) {
  const [state, setState] = useState<CdState>(() => sampleState(locale, FALLBACK_NOW, "UTC", titleFor));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const viewer = readViewerZone();
    const fresh = sampleState(locale, Date.now(), viewer, titleFor);
    const fromUrl = stateFromQuery(window.location.search, fresh);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of a shared link / real-clock sample
    setState(fromUrl ?? fresh);
    setReady(true);
    // titleFor is a translation lookup; re-running it on identity change would reset the visitor's input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.history.replaceState(null, "", `${window.location.pathname}?${stateToQuery(state)}`);
    } catch {
      /* history API unavailable: the share link just won't carry the inputs */
    }
  }, [state, ready]);

  return [state, setState] as const;
}

// ── Derived result ───────────────────────────────────────────────────────────────

export function stateCivil(s: CdState): CivilDate | null {
  if (s.cal === "hijri") return hijriFieldsToCivil(parseLocalizedNumber(s.hy), parseLocalizedNumber(s.hm), parseLocalizedNumber(s.hd));
  return parseCivilDate(s.date);
}

export function yearlyRule(s: CdState, civil: CivilDate): CountdownYearlyRule {
  if (s.cal === "hijri") {
    const h = gregorianToHijri(civil);
    return { calendar: "hijri", month: h.month, day: Number(s.hd) || h.day };
  }
  return { calendar: "gregorian", month: civil.month, day: civil.day, leapRule: s.leap };
}

/** Target instant for a state: the entered date, or its next yearly occurrence once passed. */
export function resolveState(s: CdState, nowMs: number) {
  const civil = stateCivil(s);
  if (!civil || !isValidIanaZone(s.zone)) return null;
  const clock = parseClock(s.time);
  const entered = countdownResolveTarget(civil, clock, s.zone);
  const rolled = s.yearly && entered.utcMs < nowMs;
  const occ = rolled ? countdownNextOccurrence(yearlyRule(s, civil), clock, s.zone, nowMs) : null;
  const target = occ ?? entered;
  return { civil, clock, entered, rolled, adjusted: occ?.adjusted ?? false, target };
}

export function derive(s: CdState, nowMs: number, viewerZone: string, savedTitles: { id: string; state: CdState }[] = []) {
  const r = resolveState(s, nowMs);
  if (!r) return null;
  const { target } = r;
  const b = countdownBreakdown(target.utcMs, nowMs);
  const days = countdownDaysLeft(nowMs, target.date, s.zone, s.weekend);
  const other = countdownDaysLeft(nowMs, target.date, s.zone, s.weekend === "fri-sat" ? "sat-sun" : "fri-sat");
  const startCivil = parseCivilDate(s.start);
  let startMs = startCivil ? countdownResolveTarget(startCivil, { hour: 0, minute: 0 }, s.zone).utcMs : NaN;
  if (!(startMs < target.utcMs)) {
    startMs = s.yearly ? countdownPreviousOccurrence(yearlyRule(s, r.civil), r.clock, s.zone, target.utcMs - 1000).utcMs : target.utcMs - 30 * DAY_MS;
  }
  const progress = countdownProgress(startMs, target.utcMs, nowMs);
  const hijri = gregorianToHijri(target.date);
  const weekday = new Date(civilToUtcMs(target.date)).getUTCDay();
  const nowOffset = zoneOffsetMinutes(nowMs, s.zone);
  const viewerOffset = zoneOffsetMinutes(target.utcMs, viewerZone);
  const dstChange = countdownDstChangeBefore(s.zone, nowMs, target.utcMs);
  const milestones = countdownMilestones(target.utcMs, nowMs);
  const weekdayCounts = days.calendarDays > 0 ? weekdayCountsInRange(days.from, target.date) : [0, 0, 0, 0, 0, 0, 0];
  const saved = savedTitles
    .map((x) => ({ id: x.id, title: x.state.title, r: resolveState(x.state, nowMs), state: x.state }))
    .filter((x) => x.r)
    .map((x) => ({ id: x.id, title: x.title, utcMs: x.r!.target.utcMs, state: x.state }));
  return { ...r, b, days, other, startMs, progress, hijri, weekday, nowOffset, viewerOffset, viewerZone, dstChange, milestones, weekdayCounts, saved, nowMs };
}

export type Derived = NonNullable<ReturnType<typeof derive>>;

export function useDerived(s: CdState, nowMs: number, viewerZone: string, saved: SavedCountdown[]) {
  // Saved list resolved once per second along with the clock; cheap (a few Intl calls each).
  return useMemo(() => derive(s, nowMs, viewerZone, saved.map((x) => ({ id: x.id, state: x }))), [s, nowMs, viewerZone, saved]);
}

// ── Formatting ───────────────────────────────────────────────────────────────────

export const num = (v: number, digits = 0) => formatLocalizedNumber(v, "western", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
export const pct = (v: number, digits = 1) => `${formatLocalizedNumber(v * 100, "western", { maximumFractionDigits: digits, minimumFractionDigits: digits })}%`;
export const two = (v: number) => String(v).padStart(2, "0");
export const hms = (h: number, m: number, s: number) => `${two(h)}:${two(m)}:${two(s)}`;
export { formatOffset };

function safeFormat(locale: string, opts: Intl.DateTimeFormatOptions, ms: number): string {
  try {
    return new Intl.DateTimeFormat(locale, opts).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString().slice(0, 16).replace("T", " ");
  }
}

/** Date + time of an instant in a zone, in the page language (Latin digits). */
export function fmtInZone(locale: string, ms: number, zone: string, withTime = true): string {
  return safeFormat(
    `${locale}-u-nu-latn`,
    withTime ? { timeZone: zone, dateStyle: "medium", timeStyle: "short", hourCycle: "h23" } : { timeZone: zone, dateStyle: "medium" },
    ms,
  );
}

export function fmtWeekday(locale: string, civil: CivilDate): string {
  return safeFormat(`${locale}-u-nu-latn`, { timeZone: "UTC", weekday: "long" }, civilToUtcMs(civil));
}

export function fmtShortWeekday(locale: string, dow: number): string {
  // 2026-10-18 is a Sunday.
  return safeFormat(`${locale}-u-nu-latn`, { timeZone: "UTC", weekday: "short" }, Date.UTC(2026, 9, 18 + dow));
}

/** Hijri date (Umm al-Qura) of a civil date, in the page language. */
export function fmtHijri(locale: string, civil: CivilDate): string {
  return safeFormat(`${locale}-u-ca-islamic-umalqura-nu-latn`, { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }, civilToUtcMs(civil));
}

export function hijriMonthName(locale: string, hy: number, hm: number): string {
  const g = hijriFieldsToCivil(hy, hm, 1);
  if (!g) return String(hm);
  return safeFormat(`${locale}-u-ca-islamic-umalqura-nu-latn`, { timeZone: "UTC", month: "long" }, civilToUtcMs(g));
}

// ── Zones ────────────────────────────────────────────────────────────────────────

export type ZoneOption = { zone: string; label: string };

export function zoneOptions(locale: string, nowMs: number, extra: string[]): ZoneOption[] {
  const ar = locale.startsWith("ar");
  const rows = WT_CITIES.map((c) => ({ zone: c.zone, name: ar ? c.name.ar : c.name.en }));
  for (const z of ["UTC", ...extra]) {
    if (z && isValidIanaZone(z) && !rows.some((r) => r.zone === z)) rows.push({ zone: z, name: z.split("/").pop()!.replace(/_/g, " ") });
  }
  return rows
    .map((r) => ({ zone: r.zone, off: zoneOffsetMinutes(nowMs, r.zone), name: r.name }))
    // Explicit locale: the runtime default differs between server and browser, which ordered Arabic and Latin
    // names differently and broke hydration (React #418 on ar).
    .sort((a, b) => a.off - b.off || a.name.localeCompare(b.name, locale))
    .map((r) => ({ zone: r.zone, label: `${r.name} (${formatOffset(r.off)})` }));
}

export function zoneName(locale: string, zone: string): string {
  const c = WT_CITIES.find((x) => x.zone === zone);
  if (c) return locale.startsWith("ar") ? c.name.ar : c.name.en;
  return zone === "UTC" ? "UTC" : zone.split("/").pop()!.replace(/_/g, " ");
}
