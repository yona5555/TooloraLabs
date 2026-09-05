import { addDays, differenceInCalendarDays } from "date-fns";
import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type DueDateMethod = "lmp" | "conception" | "ivf3day" | "ivf5day";

export type DueDateInput = {
  method: DueDateMethod;
  /** ISO date (YYYY-MM-DD) for the LMP, conception, or transfer date, depending on method. */
  date: string;
  /** Average cycle length in days. Only used (and only meaningful) for the "lmp" method. Defaults to 28. */
  cycleLengthDays?: number;
  /** Defaults to today; overridable for testing and for computing gestational age as of a specific date. */
  referenceDate?: string;
};

export type DueDateError = "invalid-date" | "invalid-cycle-length" | "date-in-future";

export type Trimester = 1 | 2 | 3;

export type DueDateOutput = {
  error: DueDateError | null;
  dueDateISO: string;
  conceptionDateISO: string;
  gestationalAgeWeeks: number;
  gestationalAgeDays: number;
  trimester: Trimester;
  daysUntilDue: number;
  percentComplete: number;
};

const FULL_TERM_DAYS = 280;
const DEFAULT_CYCLE_LENGTH = 28;
const CONCEPTION_TO_DUE_DAYS = 266;

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

/**
 * All four methods ultimately anchor on an estimated conception date, then add the standard
 * 266-day (38-week) conception-to-birth interval. For LMP, conception is estimated 14 days
 * after the period start, adjusted for a cycle length other than the 28-day average (Naegele's
 * rule, adjusted). For IVF, the transfer date directly implies a known embryo age.
 */
function estimateConceptionDate(method: DueDateMethod, anchorDate: Date, cycleLengthDays: number): Date {
  if (method === "lmp") {
    const ovulationDay = cycleLengthDays - 14;
    return addDays(anchorDate, ovulationDay);
  }
  if (method === "conception") return anchorDate;
  if (method === "ivf3day") return addDays(anchorDate, -3);
  return addDays(anchorDate, -5); // ivf5day
}

export class DueDateCalculator extends BaseCalculator<DueDateInput, DueDateOutput> {
  metadata = {
    id: "due-date-calculator",
    slug: "due-date-calculator",
    name: "Due Date Calculator",
    category: "health-fitness",
    description: "Estimate your due date from your last menstrual period, conception date, or IVF transfer date, with current gestational age and trimester.",
    version: "1.0.0",
  };

  execute(input: DueDateInput, _context: ToolContext): ToolResult<DueDateOutput> {
    const { method, date, cycleLengthDays = DEFAULT_CYCLE_LENGTH } = input;
    const anchorDate = parseISODateLocal(date);
    const referenceDate = input.referenceDate ? parseISODateLocal(input.referenceDate) : new Date();
    referenceDate.setHours(0, 0, 0, 0);

    if (Number.isNaN(anchorDate.getTime())) {
      return this.error("invalid-date");
    }
    if (method === "lmp" && (!Number.isFinite(cycleLengthDays) || cycleLengthDays < 20 || cycleLengthDays > 45)) {
      return this.error("invalid-cycle-length");
    }
    if (anchorDate > referenceDate) {
      return this.error("date-in-future");
    }

    const conceptionDate = estimateConceptionDate(method, anchorDate, cycleLengthDays);
    const dueDate = addDays(conceptionDate, CONCEPTION_TO_DUE_DAYS);

    const gestationalAgeTotalDays = Math.max(0, differenceInCalendarDays(referenceDate, conceptionDate) + 14);
    const gestationalAgeWeeks = Math.floor(gestationalAgeTotalDays / 7);
    const gestationalAgeDays = gestationalAgeTotalDays % 7;

    const trimester: Trimester = gestationalAgeWeeks < 13 ? 1 : gestationalAgeWeeks < 27 ? 2 : 3;
    const daysUntilDue = differenceInCalendarDays(dueDate, referenceDate);
    const percentComplete = Math.min(100, Math.round((gestationalAgeTotalDays / FULL_TERM_DAYS) * 1000) / 10);

    return {
      success: true,
      data: {
        error: null,
        dueDateISO: toISODate(dueDate),
        conceptionDateISO: toISODate(conceptionDate),
        gestationalAgeWeeks,
        gestationalAgeDays,
        trimester,
        daysUntilDue,
        percentComplete,
      },
      metadata: {},
    };
  }

  private error(error: DueDateError): ToolResult<DueDateOutput> {
    return {
      success: true,
      data: {
        error,
        dueDateISO: "",
        conceptionDateISO: "",
        gestationalAgeWeeks: 0,
        gestationalAgeDays: 0,
        trimester: 1,
        daysUntilDue: 0,
        percentComplete: 0,
      },
      metadata: {},
    };
  }
}
