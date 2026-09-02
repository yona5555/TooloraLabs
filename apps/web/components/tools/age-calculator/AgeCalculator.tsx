"use client";
import { parseLocalizedNumber, gregorianToHijri, hijriToGregorian, type DigitStyle } from "@tooloralabs/core";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AgeCalculator as AgeCalculatorTool, type Gender } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import AgeInputPanel from "./AgeInputPanel";
import AgeResult from "./AgeResult";
import AgeMiniDateDiff from "./AgeMiniDateDiff";
import AgeMilestones from "./AgeMilestones";
import AgeLifeExpectancyCard from "./AgeLifeExpectancyCard";
import AgePlanetaryAge from "./AgePlanetaryAge";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import type { AgeExtendedResult, CalendarSystem } from "./types";

const tool = new AgeCalculatorTool();
const DEFAULT_BIRTH_DATE = "1994-06-15";
const FROZEN_FALLBACK_REFERENCE = "2026-01-01";
const MAX_AGE_YEARS = 120;
const MAX_REFERENCE_SPAN_YEARS = 130;

function parseISODateLocal(value: string): Date | null {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildResult(birthDateISO: string, referenceDateISO?: string): AgeExtendedResult {
  const output = tool.execute(
    { birthDate: birthDateISO, referenceDate: referenceDateISO },
    { locale: "en-US" }
  );
  return output.data;
}

function defaultHijriFields(birthDateISO: string) {
  const parsed = parseISODateLocal(birthDateISO);
  const hijri = gregorianToHijri(parsed ?? new Date());
  return { day: String(hijri.day), month: String(hijri.month), year: String(hijri.year) };
}

/**
 * Age depends on "now", but this page is statically prerendered — the
 * server-rendered HTML and the first client paint before hydration must
 * show byte-identical content, or React logs a hydration mismatch (the
 * same class of bug fixed once already in BMIScaleChart). getServerSnapshot
 * returns a sentinel (0) used for both the SSR pass and the first client
 * render; only once useSyncExternalStore's subscribe callback fires (right
 * after hydration commits, then every second) does the real clock kick in.
 */
let cachedLiveTimestamp = 0;

function getLiveTimestamp(): number {
  return cachedLiveTimestamp;
}

function getFrozenTimestamp(): number {
  return 0;
}

/**
 * useSyncExternalStore requires getSnapshot to return the same value between
 * calls until something actually changes — returning Date.now() directly
 * from getSnapshot means every call produces a new value, which React reads
 * as a permanent tear and re-renders forever ("Maximum update depth
 * exceeded"). Caching the timestamp here and only updating it from the tick
 * itself keeps the snapshot stable except on the once-per-second tick.
 */
function subscribeToLiveTick(callback: () => void): () => void {
  const tick = () => {
    cachedLiveTimestamp = Date.now();
    callback();
  };
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}

export default function AgeCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.age-calculator");

  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>("gregorian");
  const [birthDate, setBirthDate] = useState(DEFAULT_BIRTH_DATE);
  const [gender, setGender] = useState<Gender>("male");
  const initialHijri = defaultHijriFields(DEFAULT_BIRTH_DATE);
  const [hijriDay, setHijriDay] = useState(initialHijri.day);
  const [hijriMonth, setHijriMonth] = useState(initialHijri.month);
  const [hijriYear, setHijriYear] = useState(initialHijri.year);

  const [useCustomReference, setUseCustomReference] = useState(false);
  const [referenceDate, setReferenceDate] = useState("");

  const [error, setError] = useState("");
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  const [calcBirthISO, setCalcBirthISO] = useState(DEFAULT_BIRTH_DATE);
  const [calcReferenceISO, setCalcReferenceISO] = useState<string | null>(null);

  const liveTimestamp = useSyncExternalStore(subscribeToLiveTick, getLiveTimestamp, getFrozenTimestamp);

  const result: AgeExtendedResult =
    calcReferenceISO !== null
      ? buildResult(calcBirthISO, calcReferenceISO)
      : liveTimestamp === 0
        ? buildResult(calcBirthISO, FROZEN_FALLBACK_REFERENCE)
        : buildResult(calcBirthISO, undefined);

  function handleCalendarSystemChange(next: CalendarSystem) {
    if (next === calendarSystem) return;

    if (next === "hijri") {
      const parsed = parseISODateLocal(birthDate);
      if (parsed) {
        const hijri = gregorianToHijri(parsed);
        setHijriDay(String(hijri.day));
        setHijriMonth(String(hijri.month));
        setHijriYear(String(hijri.year));
      }
    } else {
      const day = parseLocalizedNumber(hijriDay);
      const month = parseLocalizedNumber(hijriMonth);
      const year = parseLocalizedNumber(hijriYear);
      if (![day, month, year].some(Number.isNaN)) {
        setBirthDate(toISODate(hijriToGregorian({ year, month, day })));
      }
    }

    setCalendarSystem(next);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    let birthISO: string;

    if (calendarSystem === "gregorian") {
      if (!birthDate) {
        setError(t("errors.required"));
        return;
      }
      const parsed = parseISODateLocal(birthDate);
      if (!parsed) {
        setError(t("errors.invalidDate"));
        return;
      }
      birthISO = birthDate;
    } else {
      if (!hijriDay || !hijriYear) {
        setError(t("errors.required"));
        return;
      }
      const day = parseLocalizedNumber(hijriDay);
      const month = parseLocalizedNumber(hijriMonth);
      const year = parseLocalizedNumber(hijriYear);
      if ([day, month, year].some(Number.isNaN) || day < 1 || day > 30 || month < 1 || month > 12 || year < 1) {
        setError(t("errors.hijriInvalid"));
        return;
      }
      birthISO = toISODate(hijriToGregorian({ year, month, day }));
    }

    const parsedBirth = parseISODateLocal(birthISO);
    if (!parsedBirth) {
      setError(t("errors.invalidDate"));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedBirth > today) {
      setError(t("errors.futureDate"));
      return;
    }
    const oldestValid = new Date(today);
    oldestValid.setFullYear(today.getFullYear() - MAX_AGE_YEARS);
    if (parsedBirth < oldestValid) {
      setError(t("errors.tooOld"));
      return;
    }

    let referenceISO: string | null = null;
    if (useCustomReference) {
      if (!referenceDate) {
        setError(t("errors.referenceRequired"));
        return;
      }
      const parsedReference = parseISODateLocal(referenceDate);
      if (!parsedReference) {
        setError(t("errors.referenceInvalid"));
        return;
      }
      if (parsedReference < parsedBirth) {
        setError(t("errors.referenceBeforeBirth"));
        return;
      }
      const maxReference = new Date(parsedBirth);
      maxReference.setFullYear(maxReference.getFullYear() + MAX_REFERENCE_SPAN_YEARS);
      if (parsedReference > maxReference) {
        setError(t("errors.referenceTooFarFuture"));
        return;
      }
      referenceISO = referenceDate;
    }

    setCalcBirthISO(birthISO);
    setCalcReferenceISO(referenceISO);
    setDigitStyle(
      resolveDigitStyle(
        calendarSystem === "gregorian" ? birthDate : hijriYear,
        useCustomReference ? referenceDate : ""
      )
    );
  }

  function handleReset() {
    setCalendarSystem("gregorian");
    setBirthDate(DEFAULT_BIRTH_DATE);
    setGender("male");
    const hijri = defaultHijriFields(DEFAULT_BIRTH_DATE);
    setHijriDay(hijri.day);
    setHijriMonth(hijri.month);
    setHijriYear(hijri.year);
    setUseCustomReference(false);
    setReferenceDate("");
    setError("");
    setDigitStyle("western");
    setCalcBirthISO(DEFAULT_BIRTH_DATE);
    setCalcReferenceISO(null);
  }

  return (
    <>
      <ToolAboveFold
        input={
          <div className="flex flex-col gap-4">
            <AgeInputPanel
              calendarSystem={calendarSystem}
              onCalendarSystemChange={handleCalendarSystemChange}
              birthDate={birthDate}
              onBirthDateChange={setBirthDate}
              gender={gender}
              onGenderChange={setGender}
              hijriDay={hijriDay}
              onHijriDayChange={setHijriDay}
              hijriMonth={hijriMonth}
              onHijriMonthChange={setHijriMonth}
              hijriYear={hijriYear}
              onHijriYearChange={setHijriYear}
              useCustomReference={useCustomReference}
              onUseCustomReferenceChange={setUseCustomReference}
              referenceDate={referenceDate}
              onReferenceDateChange={setReferenceDate}
              error={error}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
            <AgePlanetaryAge totalDays={result.totalDays} digitStyle={digitStyle} />
          </div>
        }
        result={
          <div className="flex flex-col gap-4">
            <AgeResult result={result} digitStyle={digitStyle} />
            <AgeLifeExpectancyCard decimalAge={result.decimalAge} gender={gender} digitStyle={digitStyle} />
            <AgeMiniDateDiff />
          </div>
        }
        sidebar={<RelatedToolsSidebar currentSlug="age-calculator" category="date-time" />}
        secondary={<AgeMilestones result={result} digitStyle={digitStyle} />}
      />

      {education}
    </>
  );
}
