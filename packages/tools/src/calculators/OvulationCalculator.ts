import { addDays } from "date-fns";
import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type OvulationCalculatorInput = {
  /** ISO date (YYYY-MM-DD) for the first day of the last menstrual period. */
  lastPeriodDate: string;
  /** Average cycle length in days. Defaults to 28. */
  cycleLengthDays?: number;
  /** Average luteal phase length in days (time from ovulation to next period). Defaults to 14. */
  lutealPhaseDays?: number;
};

export type OvulationCalculatorError = "invalid-date" | "invalid-cycle-length" | "invalid-luteal-phase";

export type FertileWindow = {
  cycleNumber: number;
  fertileWindowStartISO: string;
  ovulationDateISO: string;
  fertileWindowEndISO: string;
  nextPeriodDateISO: string;
};

export type OvulationCalculatorOutput = {
  error: OvulationCalculatorError | null;
  cycles: FertileWindow[];
};

const CYCLES_TO_PROJECT = 3;
/** Sperm can survive up to ~5 days; the egg is viable for ~24 hours, so the fertile window
 * conventionally spans the 5 days before ovulation through 1 day after. */
const FERTILE_WINDOW_DAYS_BEFORE = 5;
const FERTILE_WINDOW_DAYS_AFTER = 1;

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODateLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day);
}

/**
 * Ovulation is estimated as occurring `lutealPhaseDays` before the *next* period — the luteal
 * phase (post-ovulation) is far more consistent in length across cycles than the follicular
 * phase (pre-ovulation), which is why counting backward from the next period is more reliable
 * than counting forward a fixed number of days from the last one.
 */
export class OvulationCalculator extends BaseCalculator<OvulationCalculatorInput, OvulationCalculatorOutput> {
  metadata = {
    id: "ovulation-calculator",
    slug: "ovulation-calculator",
    name: "Ovulation Calculator",
    category: "health-fitness",
    description: "Estimate your next ovulation date and fertile window from your last period and average cycle length, projected across the next three cycles.",
    version: "1.0.0",
  };

  execute(input: OvulationCalculatorInput, _context: ToolContext): ToolResult<OvulationCalculatorOutput> {
    const { lastPeriodDate, cycleLengthDays = 28, lutealPhaseDays = 14 } = input;
    const startDate = parseISODateLocal(lastPeriodDate);

    if (Number.isNaN(startDate.getTime())) {
      return this.error("invalid-date");
    }
    if (!Number.isFinite(cycleLengthDays) || cycleLengthDays < 20 || cycleLengthDays > 45) {
      return this.error("invalid-cycle-length");
    }
    if (!Number.isFinite(lutealPhaseDays) || lutealPhaseDays < 10 || lutealPhaseDays > 17) {
      return this.error("invalid-luteal-phase");
    }

    const cycles: FertileWindow[] = [];
    for (let i = 0; i < CYCLES_TO_PROJECT; i++) {
      const nextPeriodDate = addDays(startDate, cycleLengthDays * (i + 1));
      const ovulationDate = addDays(nextPeriodDate, -lutealPhaseDays);
      cycles.push({
        cycleNumber: i + 1,
        fertileWindowStartISO: toISODate(addDays(ovulationDate, -FERTILE_WINDOW_DAYS_BEFORE)),
        ovulationDateISO: toISODate(ovulationDate),
        fertileWindowEndISO: toISODate(addDays(ovulationDate, FERTILE_WINDOW_DAYS_AFTER)),
        nextPeriodDateISO: toISODate(nextPeriodDate),
      });
    }

    return {
      success: true,
      data: { error: null, cycles },
      metadata: {},
    };
  }

  private error(error: OvulationCalculatorError): ToolResult<OvulationCalculatorOutput> {
    return { success: true, data: { error, cycles: [] }, metadata: {} };
  }
}
