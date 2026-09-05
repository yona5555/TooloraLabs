import { describe, it, expect } from "vitest";
import { TargetHeartRateCalculator } from "../TargetHeartRateCalculator";

const context = { locale: "en-US" };
const calc = new TargetHeartRateCalculator();

describe("TargetHeartRateCalculator", () => {
  it("computes max heart rate via 220 minus age", () => {
    const r = calc.execute({ age: 30 }, context);
    expect(r.data.error).toBeNull();
    expect(r.data.maxHeartRate).toBe(190);
  });

  it("computes simple percentage-based zones with no resting heart rate", () => {
    const r = calc.execute({ age: 20 }, context);
    expect(r.data.maxHeartRate).toBe(200);
    const moderate = r.data.zones.find((z) => z.key === "moderate")!;
    expect(moderate.lowBpm).toBeCloseTo(140, 10);
    expect(moderate.highBpm).toBeCloseTo(160, 10);
  });

  it("computes Karvonen (heart rate reserve) zones when resting heart rate is given", () => {
    const r = calc.execute({ age: 20, restingHeartRate: 60 }, context);
    expect(r.data.heartRateReserve).toBe(140);
    const moderate = r.data.zones.find((z) => z.key === "moderate")!;
    // reserve=140; 0.7*140+60=158, 0.8*140+60=172
    expect(moderate.lowBpm).toBeCloseTo(158, 10);
    expect(moderate.highBpm).toBeCloseTo(172, 10);
  });

  it("returns all five zones in ascending intensity order", () => {
    const r = calc.execute({ age: 40 }, context);
    expect(r.data.zones.map((z) => z.key)).toEqual(["veryLight", "light", "moderate", "hard", "maximum"]);
  });

  it("rejects non-positive or unrealistic ages", () => {
    expect(calc.execute({ age: 0 }, context).data.error).toBe("invalid-age");
    expect(calc.execute({ age: -5 }, context).data.error).toBe("invalid-age");
    expect(calc.execute({ age: 200 }, context).data.error).toBe("invalid-age");
  });

  it("rejects an invalid resting heart rate", () => {
    expect(calc.execute({ age: 30, restingHeartRate: 0 }, context).data.error).toBe("invalid-resting-heart-rate");
    expect(calc.execute({ age: 30, restingHeartRate: 300 }, context).data.error).toBe("invalid-resting-heart-rate");
  });
});
