import { addDays, addMonths, addYears, differenceInCalendarDays, intervalToDuration } from "date-fns";
import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type DateCalculatorMode = "difference" | "addSubtract";
export type DateUnit = "days" | "weeks" | "months" | "years";
export type DateOperation = "add" | "subtract";

export type DateCalculatorInput = {
  mode: DateCalculatorMode;
  /** ISO date (YYYY-MM-DD). Start date for both modes. */
  startDate: string;
  /** ISO date (YYYY-MM-DD). Required for "difference" mode. */
  endDate?: string;
  /** Required for "addSubtract" mode. */
  amount?: number;
  unit?: DateUnit;
  operation?: DateOperation;
};

export type DateCalculatorError = "invalid-date" | "invalid-amount";

export type DateDifferenceResult = {
  totalDays: number;
  totalWeeks: number;
  years: number;
  months: number;
  days: number;
  isEndBeforeStart: boolean;
};

export type DateCalculatorOutput = {
  error: DateCalculatorError | null;
  difference: DateDifferenceResult | null;
  resultDateISO: string | null;
};

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

function addByUnit(date: Date, amount: number, unit: DateUnit): Date {
  if (unit === "days") return addDays(date, amount);
  if (unit === "weeks") return addDays(date, amount * 7);
  if (unit === "months") return addMonths(date, amount);
  return addYears(date, amount);
}

export class DateCalculator extends BaseCalculator<DateCalculatorInput, DateCalculatorOutput> {
  metadata = {
    id: "date-calculator",
    slug: "date-calculator",
    name: "Date Calculator",
    category: "date-time",
    description: "Find the difference between two dates in days, weeks, months, and years, or add/subtract a duration from a date.",
    version: "1.0.0",
  };

  execute(input: DateCalculatorInput, _context: ToolContext): ToolResult<DateCalculatorOutput> {
    const startDate = parseISODateLocal(input.startDate);
    if (Number.isNaN(startDate.getTime())) {
      return this.error("invalid-date");
    }

    if (input.mode === "difference") {
      const endDate = input.endDate ? parseISODateLocal(input.endDate) : new Date(NaN);
      if (Number.isNaN(endDate.getTime())) {
        return this.error("invalid-date");
      }

      const isEndBeforeStart = endDate < startDate;
      const [earlier, later] = isEndBeforeStart ? [endDate, startDate] : [startDate, endDate];
      const totalDays = differenceInCalendarDays(later, earlier);
      const duration = intervalToDuration({ start: earlier, end: later });

      return {
        success: true,
        data: {
          error: null,
          difference: {
            totalDays,
            totalWeeks: Math.floor(totalDays / 7),
            years: duration.years ?? 0,
            months: duration.months ?? 0,
            days: duration.days ?? 0,
            isEndBeforeStart,
          },
          resultDateISO: null,
        },
        metadata: {},
      };
    }

    // addSubtract mode
    const amount = input.amount ?? NaN;
    const unit = input.unit ?? "days";
    const operation = input.operation ?? "add";

    if (!Number.isFinite(amount) || amount < 0) {
      return this.error("invalid-amount");
    }

    const signedAmount = operation === "subtract" ? -amount : amount;
    const resultDate = addByUnit(startDate, signedAmount, unit);

    return {
      success: true,
      data: { error: null, difference: null, resultDateISO: toISODate(resultDate) },
      metadata: {},
    };
  }

  private error(error: DateCalculatorError): ToolResult<DateCalculatorOutput> {
    return { success: true, data: { error, difference: null, resultDateISO: null }, metadata: {} };
  }
}
