import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import { formatIsoDate, parseCivilDate, type WeekendPreset } from "./DateTimeCore";
import { addDateSpan, computeDateSpan, type DateSpanUnit } from "./DateCalculatorEngine";

export type DateCalculatorMode = "difference" | "addSubtract";
export type DateUnit = DateSpanUnit;
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
  /** Count the end date itself in "difference" mode (default false). */
  includeEnd?: boolean;
  /** Weekend used for business days (default "sat-sun"). */
  weekend?: WeekendPreset;
  /** ISO dates skipped as holidays when counting/adding business days. */
  holidays?: string[];
};

export type DateCalculatorError = "invalid-date" | "invalid-amount";

export type DateDifferenceResult = {
  totalDays: number;
  totalWeeks: number;
  years: number;
  months: number;
  days: number;
  isEndBeforeStart: boolean;
  businessDays: number;
};

export type DateCalculatorOutput = {
  error: DateCalculatorError | null;
  difference: DateDifferenceResult | null;
  resultDateISO: string | null;
};

export class DateCalculator extends BaseCalculator<DateCalculatorInput, DateCalculatorOutput> {
  metadata = {
    id: "date-calculator",
    slug: "date-calculator",
    name: "Date Calculator",
    category: "date-time",
    description: "Find the difference between two dates in years/months/days, total days, weeks and business days, or add/subtract calendar units or business days.",
    version: "2.0.0",
  };

  execute(input: DateCalculatorInput, _context: ToolContext): ToolResult<DateCalculatorOutput> {
    const startDate = parseCivilDate(input.startDate ?? "");
    if (!startDate) return this.error("invalid-date");
    const weekend = input.weekend ?? "sat-sun";
    const holidays = input.holidays ?? [];

    if (input.mode === "difference") {
      const endDate = parseCivilDate(input.endDate ?? "");
      if (!endDate) return this.error("invalid-date");
      const r = computeDateSpan({ start: startDate, end: endDate, includeEnd: input.includeEnd ?? false, weekend, holidays });
      return {
        success: true,
        data: {
          error: null,
          difference: {
            totalDays: r.totalDays,
            totalWeeks: r.weeks,
            years: r.ymd.years,
            months: r.ymd.months,
            days: r.ymd.days,
            isEndBeforeStart: r.isEndBeforeStart,
            businessDays: r.business.businessDays,
          },
          resultDateISO: null,
        },
        metadata: {},
      };
    }

    const amount = input.amount ?? NaN;
    if (!Number.isFinite(amount) || amount < 0) return this.error("invalid-amount");
    const r = addDateSpan({
      start: startDate,
      amount,
      unit: input.unit ?? "days",
      operation: input.operation ?? "add",
      weekend,
      holidays,
    });
    return { success: true, data: { error: null, difference: null, resultDateISO: formatIsoDate(r.result) }, metadata: {} };
  }

  private error(error: DateCalculatorError): ToolResult<DateCalculatorOutput> {
    return { success: true, data: { error, difference: null, resultDateISO: null }, metadata: {} };
  }
}
