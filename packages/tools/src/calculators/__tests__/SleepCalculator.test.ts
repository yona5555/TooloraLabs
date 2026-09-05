import { describe, it, expect } from "vitest";
import { SleepCalculator } from "../SleepCalculator";

const context = { locale: "en-US" };
const calc = new SleepCalculator();

describe("SleepCalculator", () => {
  it("computes bedtimes counting back from a wake-up time (6:00 AM = 360 minutes)", () => {
    const r = calc.execute({ mode: "wakeUp", timeMinutes: 360 }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.options).toHaveLength(4);
    // 6 cycles = 540 min sleep + 15 min to fall asleep = 555 min before 360 -> wraps to previous day
    const sixCycles = r.data.options.find((o) => o.cycles === 6)!;
    expect(sixCycles.sleepMinutes).toBe(540);
    expect(sixCycles.clockMinutes).toBe((360 - 15 - 540 + 1440) % 1440); // 1245 -> 20:45
    expect(sixCycles.clockMinutes).toBe(1245);
  });

  it("computes wake-up times counting forward from a bedtime (23:00 = 1380 minutes)", () => {
    const r = calc.execute({ mode: "bedtime", timeMinutes: 1380 }, context);
    const sixCycles = r.data.options.find((o) => o.cycles === 6)!;
    // 1380 + 15 + 540 = 1935 -> 1935 - 1440 = 495 -> 8:15 AM
    expect(sixCycles.clockMinutes).toBe(495);
  });

  it("returns options in descending cycle count order (6 down to 3)", () => {
    const r = calc.execute({ mode: "bedtime", timeMinutes: 0 }, context);
    expect(r.data.options.map((o) => o.cycles)).toEqual([6, 5, 4, 3]);
  });

  it("respects a custom fall-asleep duration", () => {
    const withDefault = calc.execute({ mode: "bedtime", timeMinutes: 0 }, context).data.options[0];
    const withCustom = calc.execute({ mode: "bedtime", timeMinutes: 0, fallAsleepMinutes: 30 }, context).data.options[0];
    expect(withCustom.clockMinutes).toBe((withDefault.clockMinutes + 15) % 1440);
  });

  it("rejects an out-of-range time", () => {
    expect(calc.execute({ mode: "wakeUp", timeMinutes: -1 }, context).data.error).toBe("invalid-time");
    expect(calc.execute({ mode: "wakeUp", timeMinutes: 1440 }, context).data.error).toBe("invalid-time");
  });

  it("rejects an invalid fall-asleep duration", () => {
    expect(calc.execute({ mode: "wakeUp", timeMinutes: 360, fallAsleepMinutes: -5 }, context).data.error).toBe("invalid-fall-asleep-minutes");
    expect(calc.execute({ mode: "wakeUp", timeMinutes: 360, fallAsleepMinutes: 200 }, context).data.error).toBe("invalid-fall-asleep-minutes");
  });
});
