import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type SleepMode = "wakeUp" | "bedtime";

export type SleepCalculatorInput = {
  mode: SleepMode;
  /** Minutes since midnight (0-1439) for the known wake-up or bedtime anchor. */
  timeMinutes: number;
  /** Minutes to allow for falling asleep after getting into bed. Defaults to 15. */
  fallAsleepMinutes?: number;
};

export type SleepCalculatorError = "invalid-time" | "invalid-fall-asleep-minutes";

export type SleepOption = {
  /** Number of complete 90-minute sleep cycles this option provides. */
  cycles: number;
  /** Total time asleep, in minutes (cycles * 90). */
  sleepMinutes: number;
  /** Minutes since midnight (may exceed 1439 to indicate the next day) for the suggested clock time. */
  clockMinutes: number;
};

export type SleepCalculatorOutput = {
  error: SleepCalculatorError | null;
  options: SleepOption[];
};

const CYCLE_MINUTES = 90;
const DEFAULT_FALL_ASLEEP_MINUTES = 15;
const MINUTES_PER_DAY = 1440;

/** Offers 6 down to 3 completed sleep cycles (9h to 4.5h of sleep) — the range every mainstream sleep-cycle calculator suggests. */
const CYCLE_COUNTS = [6, 5, 4, 3];

/**
 * Works backward from a target wake-up time (subtracting whole 90-minute sleep cycles plus
 * time to fall asleep) or forward from a bedtime (adding whole cycles), on the theory that
 * waking up between cycles rather than mid-cycle feels less groggy. This is a popular
 * heuristic, not a personalized sleep-stage measurement — actual cycle length varies by
 * person and by night.
 */
export class SleepCalculator extends BaseCalculator<SleepCalculatorInput, SleepCalculatorOutput> {
  metadata = {
    id: "sleep-calculator",
    slug: "sleep-calculator",
    name: "Sleep Calculator",
    category: "health-fitness",
    description: "Find the best bedtimes or wake-up times based on 90-minute sleep cycles, so you wake up between cycles instead of mid-cycle.",
    version: "1.0.0",
  };

  execute(input: SleepCalculatorInput, _context: ToolContext): ToolResult<SleepCalculatorOutput> {
    const { mode, timeMinutes, fallAsleepMinutes = DEFAULT_FALL_ASLEEP_MINUTES } = input;

    if (!Number.isInteger(timeMinutes) || timeMinutes < 0 || timeMinutes >= MINUTES_PER_DAY) {
      return this.error("invalid-time");
    }
    if (!Number.isFinite(fallAsleepMinutes) || fallAsleepMinutes < 0 || fallAsleepMinutes > 120) {
      return this.error("invalid-fall-asleep-minutes");
    }

    const options: SleepOption[] = CYCLE_COUNTS.map((cycles) => {
      const sleepMinutes = cycles * CYCLE_MINUTES;
      const rawMinutes =
        mode === "wakeUp" ? timeMinutes - fallAsleepMinutes - sleepMinutes : timeMinutes + fallAsleepMinutes + sleepMinutes;
      const clockMinutes = ((rawMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
      return { cycles, sleepMinutes, clockMinutes };
    });

    return {
      success: true,
      data: { error: null, options },
      metadata: {},
    };
  }

  private error(error: SleepCalculatorError): ToolResult<SleepCalculatorOutput> {
    return { success: true, data: { error, options: [] }, metadata: {} };
  }
}
