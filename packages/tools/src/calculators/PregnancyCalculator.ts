import { addDays, differenceInCalendarDays } from "date-fns";
import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import type { Trimester } from "./DueDateCalculator";

export type PregnancyCalculatorInput = {
  /** ISO date (YYYY-MM-DD) for the first day of the last menstrual period. */
  lastPeriodDate: string;
  /** Defaults to today; overridable for testing and for computing progress as of a specific date. */
  referenceDate?: string;
};

export type PregnancyCalculatorError = "invalid-date" | "date-in-future" | "beyond-full-term";

/** A rough size comparison, in the tradition of "your baby is the size of a lemon" pregnancy trackers. */
export type SizeComparisonKey =
  | "poppySeed" | "sesameSeed" | "lentil" | "blueberry" | "raspberry" | "grape" | "kumquat" | "fig" | "lime"
  | "lemon" | "peach" | "apple" | "avocado" | "turnip" | "bellPepper" | "tomato" | "banana" | "carrot"
  | "spaghettiSquash" | "mango" | "cornOnTheCob" | "rutabaga" | "zucchini" | "cauliflower" | "eggplant"
  | "butternutSquash" | "cabbage" | "coconut" | "jicama" | "pineapple" | "cantaloupe" | "honeydewMelon"
  | "romaineLettuce" | "swissChard" | "leek" | "miniWatermelon" | "smallPumpkin";

export type WeekMilestone = {
  week: number;
  sizeComparison: SizeComparisonKey;
  lengthCm: number;
  weightG: number;
};

export type PregnancyCalculatorOutput = {
  error: PregnancyCalculatorError | null;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  trimester: Trimester;
  dueDateISO: string;
  daysUntilDue: number;
  percentComplete: number;
  currentWeekMilestone: WeekMilestone | null;
};

const FULL_TERM_DAYS = 280;

/**
 * Approximate median crown-rump length (through week 19) and crown-heel length (week 20+) and
 * estimated fetal weight per week, drawn from standard published fetal growth curves. Values
 * are illustrative averages for the popular "size comparison" tradition, not diagnostic
 * measurements — actual fetal size varies considerably and is assessed via ultrasound.
 */
const WEEK_MILESTONES: WeekMilestone[] = [
  { week: 4, sizeComparison: "poppySeed", lengthCm: 0.2, weightG: 0 },
  { week: 5, sizeComparison: "sesameSeed", lengthCm: 0.3, weightG: 0 },
  { week: 6, sizeComparison: "lentil", lengthCm: 0.5, weightG: 0 },
  { week: 7, sizeComparison: "blueberry", lengthCm: 1.3, weightG: 1 },
  { week: 8, sizeComparison: "raspberry", lengthCm: 1.6, weightG: 1 },
  { week: 9, sizeComparison: "grape", lengthCm: 2.3, weightG: 2 },
  { week: 10, sizeComparison: "kumquat", lengthCm: 3.1, weightG: 4 },
  { week: 11, sizeComparison: "fig", lengthCm: 4.1, weightG: 7 },
  { week: 12, sizeComparison: "lime", lengthCm: 5.4, weightG: 14 },
  { week: 13, sizeComparison: "lemon", lengthCm: 7.4, weightG: 23 },
  { week: 14, sizeComparison: "peach", lengthCm: 8.7, weightG: 43 },
  { week: 15, sizeComparison: "apple", lengthCm: 10.1, weightG: 70 },
  { week: 16, sizeComparison: "avocado", lengthCm: 11.6, weightG: 100 },
  { week: 17, sizeComparison: "turnip", lengthCm: 13.0, weightG: 140 },
  { week: 18, sizeComparison: "bellPepper", lengthCm: 14.2, weightG: 190 },
  { week: 19, sizeComparison: "tomato", lengthCm: 15.3, weightG: 240 },
  { week: 20, sizeComparison: "banana", lengthCm: 25.6, weightG: 300 },
  { week: 21, sizeComparison: "carrot", lengthCm: 26.7, weightG: 360 },
  { week: 22, sizeComparison: "spaghettiSquash", lengthCm: 27.8, weightG: 430 },
  { week: 23, sizeComparison: "mango", lengthCm: 28.9, weightG: 501 },
  { week: 24, sizeComparison: "cornOnTheCob", lengthCm: 30.0, weightG: 600 },
  { week: 25, sizeComparison: "rutabaga", lengthCm: 34.6, weightG: 660 },
  { week: 26, sizeComparison: "zucchini", lengthCm: 35.6, weightG: 760 },
  { week: 27, sizeComparison: "cauliflower", lengthCm: 36.6, weightG: 875 },
  { week: 28, sizeComparison: "eggplant", lengthCm: 37.6, weightG: 1005 },
  { week: 29, sizeComparison: "butternutSquash", lengthCm: 38.6, weightG: 1153 },
  { week: 30, sizeComparison: "cabbage", lengthCm: 39.9, weightG: 1319 },
  { week: 31, sizeComparison: "coconut", lengthCm: 41.1, weightG: 1502 },
  { week: 32, sizeComparison: "jicama", lengthCm: 42.4, weightG: 1702 },
  { week: 33, sizeComparison: "pineapple", lengthCm: 43.7, weightG: 1918 },
  { week: 34, sizeComparison: "cantaloupe", lengthCm: 45.0, weightG: 2146 },
  { week: 35, sizeComparison: "honeydewMelon", lengthCm: 46.2, weightG: 2383 },
  { week: 36, sizeComparison: "romaineLettuce", lengthCm: 47.4, weightG: 2622 },
  { week: 37, sizeComparison: "swissChard", lengthCm: 48.6, weightG: 2859 },
  { week: 38, sizeComparison: "leek", lengthCm: 49.8, weightG: 3083 },
  { week: 39, sizeComparison: "miniWatermelon", lengthCm: 50.7, weightG: 3288 },
  { week: 40, sizeComparison: "smallPumpkin", lengthCm: 51.2, weightG: 3462 },
];

function parseISODateLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day);
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function findWeekMilestone(week: number): WeekMilestone | null {
  if (week < 4) return null;
  const clampedWeek = Math.min(week, 40);
  return WEEK_MILESTONES.find((m) => m.week === clampedWeek) ?? null;
}

/**
 * Tracks an ongoing pregnancy week-by-week from the last menstrual period, pairing the
 * standard gestational-age math with a "your baby is the size of a ___" milestone lookup —
 * the signature feature that differentiates a week-by-week tracker from a one-shot due-date
 * calculation.
 */
export class PregnancyCalculator extends BaseCalculator<PregnancyCalculatorInput, PregnancyCalculatorOutput> {
  metadata = {
    id: "pregnancy-calculator",
    slug: "pregnancy-calculator",
    name: "Pregnancy Calculator",
    category: "health-fitness",
    description: "Track your pregnancy week by week from your last menstrual period, with your current trimester, due date, and a size-comparison milestone for this week.",
    version: "1.0.0",
  };

  execute(input: PregnancyCalculatorInput, _context: ToolContext): ToolResult<PregnancyCalculatorOutput> {
    const lmpDate = parseISODateLocal(input.lastPeriodDate);
    const referenceDate = input.referenceDate ? parseISODateLocal(input.referenceDate) : new Date();
    referenceDate.setHours(0, 0, 0, 0);

    if (Number.isNaN(lmpDate.getTime())) {
      return this.error("invalid-date");
    }
    if (lmpDate > referenceDate) {
      return this.error("date-in-future");
    }

    const gestationalAgeTotalDays = differenceInCalendarDays(referenceDate, lmpDate);
    if (gestationalAgeTotalDays > FULL_TERM_DAYS + 21) {
      return this.error("beyond-full-term");
    }

    const gestationalAgeWeeks = Math.floor(gestationalAgeTotalDays / 7);
    const gestationalAgeDays = gestationalAgeTotalDays % 7;
    const trimester: Trimester = gestationalAgeWeeks < 13 ? 1 : gestationalAgeWeeks < 27 ? 2 : 3;

    const dueDate = addDays(lmpDate, FULL_TERM_DAYS);
    const daysUntilDue = differenceInCalendarDays(dueDate, referenceDate);
    const percentComplete = Math.min(100, Math.round((gestationalAgeTotalDays / FULL_TERM_DAYS) * 1000) / 10);

    return {
      success: true,
      data: {
        error: null,
        gestationalAgeWeeks,
        gestationalAgeDays,
        trimester,
        dueDateISO: toISODate(dueDate),
        daysUntilDue,
        percentComplete,
        currentWeekMilestone: findWeekMilestone(gestationalAgeWeeks),
      },
      metadata: {},
    };
  }

  private error(error: PregnancyCalculatorError): ToolResult<PregnancyCalculatorOutput> {
    return {
      success: true,
      data: {
        error,
        gestationalAgeWeeks: 0,
        gestationalAgeDays: 0,
        trimester: 1,
        dueDateISO: "",
        daysUntilDue: 0,
        percentComplete: 0,
        currentWeekMilestone: null,
      },
      metadata: {},
    };
  }
}
