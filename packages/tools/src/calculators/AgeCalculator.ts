import {
  addYears,
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInWeeks,
  intervalToDuration,
} from "date-fns";
import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { gregorianToHijri, hijriDateDifference, type HijriDate } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type Zodiac =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type ChineseZodiac =
  | "rat"
  | "ox"
  | "tiger"
  | "rabbit"
  | "dragon"
  | "snake"
  | "horse"
  | "goat"
  | "monkey"
  | "rooster"
  | "dog"
  | "pig";

export type Generation =
  | "greatestGeneration"
  | "silentGeneration"
  | "babyBoomer"
  | "generationX"
  | "millennial"
  | "generationZ"
  | "generationAlpha"
  | "generationBeta";

export type AgeMilestone = {
  ageYears: number;
  dateISO: string;
  daysRemaining: number;
  isPast: boolean;
};

export type AgeResult = {
  years: number;
  months: number;
  days: number;

  totalMonths: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;

  decimalAge: number;
  yearProgressPercent: number;

  birthDateISO: string;
  referenceDateISO: string;
  birthWeekday: number;

  nextBirthdayISO: string;
  daysUntilBirthday: number;

  zodiac: Zodiac;
  chineseZodiac: ChineseZodiac;
  generation: Generation;

  hijri: {
    years: number;
    months: number;
    days: number;
    birth: HijriDate;
    now: HijriDate;
  };

  milestones: AgeMilestone[];
};

export type AgeInput = { birthDate: string; referenceDate?: string };

const MILESTONE_AGES = [18, 21, 30, 40, 50, 65, 100] as const;

const CHINESE_ZODIAC_ANIMALS: ChineseZodiac[] = [
  "rat",
  "ox",
  "tiger",
  "rabbit",
  "dragon",
  "snake",
  "horse",
  "goat",
  "monkey",
  "rooster",
  "dog",
  "pig",
];

const ZODIAC_BOUNDARIES: { sign: Zodiac; endMonth: number; endDay: number }[] = [
  { sign: "capricorn", endMonth: 1, endDay: 19 },
  { sign: "aquarius", endMonth: 2, endDay: 18 },
  { sign: "pisces", endMonth: 3, endDay: 20 },
  { sign: "aries", endMonth: 4, endDay: 19 },
  { sign: "taurus", endMonth: 5, endDay: 20 },
  { sign: "gemini", endMonth: 6, endDay: 20 },
  { sign: "cancer", endMonth: 7, endDay: 22 },
  { sign: "leo", endMonth: 8, endDay: 22 },
  { sign: "virgo", endMonth: 9, endDay: 22 },
  { sign: "libra", endMonth: 10, endDay: 22 },
  { sign: "scorpio", endMonth: 11, endDay: 21 },
  { sign: "sagittarius", endMonth: 12, endDay: 21 },
  { sign: "capricorn", endMonth: 12, endDay: 31 },
];

/**
 * Self-consistent boundaries (no overlaps/gaps). The pre-2013 cutoffs follow
 * Pew Research Center's generation definitions, the only ones with a single
 * agreed-upon source. Pew stops at Generation Z (2012); it never defined
 * Generation Alpha. McCrindle Research — who coined "Alpha" and "Beta" —
 * puts Alpha's start at 2010, which would overlap Pew's Gen Z. To keep this
 * table gapless we start Alpha where Pew's Gen Z ends (2013) and Beta where
 * McCrindle's own Alpha ends (2025); the ~3-year source discrepancy is
 * called out in the education copy rather than silently resolved here.
 */
const GENERATION_RANGES: { generation: Generation; startYear: number; endYear: number }[] = [
  { generation: "greatestGeneration", startYear: -Infinity, endYear: 1927 },
  { generation: "silentGeneration", startYear: 1928, endYear: 1945 },
  { generation: "babyBoomer", startYear: 1946, endYear: 1964 },
  { generation: "generationX", startYear: 1965, endYear: 1980 },
  { generation: "millennial", startYear: 1981, endYear: 1996 },
  { generation: "generationZ", startYear: 1997, endYear: 2012 },
  { generation: "generationAlpha", startYear: 2013, endYear: 2024 },
  { generation: "generationBeta", startYear: 2025, endYear: Infinity },
];

function parseISODateLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getZodiacSign(month: number, day: number): Zodiac {
  for (const boundary of ZODIAC_BOUNDARIES) {
    if (month < boundary.endMonth || (month === boundary.endMonth && day <= boundary.endDay)) {
      return boundary.sign;
    }
  }
  return "capricorn";
}

/**
 * Approximation based on the Gregorian birth year alone. The real Chinese
 * New Year falls on a different Gregorian date each year (between Jan 21
 * and Feb 20), so people born in January or the first weeks of February can
 * technically belong to the previous animal year — this function cannot
 * account for that without a full lunar-calendar date table.
 */
export function getChineseZodiac(year: number): ChineseZodiac {
  const index = (((year - 2020) % 12) + 12) % 12;
  return CHINESE_ZODIAC_ANIMALS[index];
}

export function getGeneration(year: number): Generation {
  const match = GENERATION_RANGES.find((range) => year >= range.startYear && year <= range.endYear);
  return match?.generation ?? "generationBeta";
}

function computeMilestones(birthDate: Date, referenceDate: Date): AgeMilestone[] {
  return MILESTONE_AGES.map((ageYears) => {
    const date = addYears(birthDate, ageYears);
    const daysRemaining = differenceInCalendarDays(date, referenceDate);
    return {
      ageYears,
      dateISO: toISODate(date),
      daysRemaining,
      isPast: daysRemaining <= 0,
    };
  });
}

export class AgeCalculator extends BaseCalculator<AgeInput, AgeResult> {
  metadata = {
    id: "age-calculator",
    slug: "age-calculator",
    name: "Age Calculator",
    category: "calculators",
    description: "Calculate exact age, life-calendar stats, and Hijri age from a birth date.",
    version: "2.0.0",
  };

  execute(input: AgeInput, _context: ToolContext): ToolResult<AgeResult> {
    const birthDate = parseISODateLocal(input.birthDate);
    const referenceDate = input.referenceDate ? parseISODateLocal(input.referenceDate) : new Date();

    const duration = intervalToDuration({ start: birthDate, end: referenceDate });
    const years = duration.years ?? 0;
    const months = duration.months ?? 0;
    const days = duration.days ?? 0;

    const nextBirthday = new Date(referenceDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < referenceDate) {
      nextBirthday.setFullYear(referenceDate.getFullYear() + 1);
    }
    const daysUntilBirthday = differenceInCalendarDays(nextBirthday, referenceDate);

    let yearProgressPercent: number;
    if (daysUntilBirthday === 0) {
      yearProgressPercent = 0;
    } else {
      const lastBirthday = new Date(nextBirthday.getFullYear() - 1, birthDate.getMonth(), birthDate.getDate());
      const totalSpanMs = nextBirthday.getTime() - lastBirthday.getTime();
      const elapsedMs = referenceDate.getTime() - lastBirthday.getTime();
      yearProgressPercent = Math.round((elapsedMs / totalSpanMs) * 1000) / 10;
    }

    const decimalAge = Number(
      ((referenceDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(2)
    );

    const birthHijri = gregorianToHijri(birthDate);
    const nowHijri = gregorianToHijri(referenceDate);
    const hijriDiff = hijriDateDifference(birthHijri, nowHijri);

    return {
      success: true,
      data: {
        years,
        months,
        days,

        totalMonths: years * 12 + months,
        totalDays: differenceInCalendarDays(referenceDate, birthDate),
        totalWeeks: differenceInWeeks(referenceDate, birthDate),
        totalHours: differenceInHours(referenceDate, birthDate),
        totalMinutes: differenceInMinutes(referenceDate, birthDate),
        totalSeconds: differenceInSeconds(referenceDate, birthDate),

        decimalAge,
        yearProgressPercent,

        birthDateISO: toISODate(birthDate),
        referenceDateISO: toISODate(referenceDate),
        birthWeekday: birthDate.getDay(),

        nextBirthdayISO: toISODate(nextBirthday),
        daysUntilBirthday,

        zodiac: getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate()),
        chineseZodiac: getChineseZodiac(birthDate.getFullYear()),
        generation: getGeneration(birthDate.getFullYear()),

        hijri: {
          years: hijriDiff.years,
          months: hijriDiff.months,
          days: hijriDiff.days,
          birth: birthHijri,
          now: nowHijri,
        },

        milestones: computeMilestones(birthDate, referenceDate),
      },
      metadata: {},
    };
  }
}
