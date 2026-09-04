import { describe, it, expect } from "vitest";
import {
  solvePaceFromDistanceAndTime,
  solveTimeFromDistanceAndPace,
  solveDistanceFromTimeAndPace,
  convertDistanceValue,
  convertPaceSeconds,
  secondsFromParts,
  formatClock,
  calculateMultipointSegments,
  predictFinishTimeSeconds,
  KM_PER_MILE,
} from "../PaceCalculator";

describe("PaceCalculator", () => {
  describe("solvePaceFromDistanceAndTime", () => {
    it("computes pace per km and per mile for a 5K run in 25 minutes", () => {
      const r = solvePaceFromDistanceAndTime(5, "km", secondsFromParts(0, 25, 0));
      expect(r.valid).toBe(true);
      expect(r.paceSecondsPerKm).toBe(300); // 5:00/km
      expect(r.paceSecondsPerMi).toBeCloseTo(300 * KM_PER_MILE, 5);
      expect(r.speedKmh).toBeCloseTo(12, 5);
    });

    it("flags non-positive distance or time as invalid", () => {
      expect(solvePaceFromDistanceAndTime(0, "km", 300).valid).toBe(false);
      expect(solvePaceFromDistanceAndTime(5, "km", 0).valid).toBe(false);
      expect(solvePaceFromDistanceAndTime(-5, "km", 300).valid).toBe(false);
    });
  });

  describe("solveTimeFromDistanceAndPace", () => {
    it("computes total time from distance and a per-km pace", () => {
      const r = solveTimeFromDistanceAndPace(10, "km", 300); // 5:00/km pace, 10K
      expect(r.timeSeconds).toBe(3000); // 50:00
      expect(formatClock(r.timeSeconds)).toBe("50:00");
    });

    it("computes total time from distance and a per-mile pace", () => {
      const r = solveTimeFromDistanceAndPace(1, "mi", 480); // 8:00/mi, 1 mile
      expect(r.timeSeconds).toBe(480);
      expect(r.paceSecondsPerKm).toBeCloseTo(480 / KM_PER_MILE, 5);
    });
  });

  describe("solveDistanceFromTimeAndPace", () => {
    it("computes distance from total time and pace", () => {
      const r = solveDistanceFromTimeAndPace(3000, "km", 300); // 50:00 at 5:00/km
      expect(r.distance).toBeCloseTo(10, 5);
    });
  });

  describe("unit conversion", () => {
    it("converts distance between km and miles", () => {
      expect(convertDistanceValue(1, "mi", "km")).toBeCloseTo(1.609344, 6);
      expect(convertDistanceValue(1.609344, "km", "mi")).toBeCloseTo(1, 6);
    });

    it("converts pace between per-km and per-mile at the same speed", () => {
      // 5:00/km is slower per-unit-distance than 5:00/mi at the same actual speed conversion
      const perKm = convertPaceSeconds(480, "mi", "km"); // 8:00/mi -> seconds/km
      expect(perKm).toBeCloseTo(480 / KM_PER_MILE, 5);
      const perMi = convertPaceSeconds(perKm, "km", "mi");
      expect(perMi).toBeCloseTo(480, 5);
    });
  });

  describe("calculateMultipointSegments", () => {
    it("computes pace between consecutive cumulative split points", () => {
      const segments = calculateMultipointSegments([
        { distance: 0, distanceUnit: "km", timeSeconds: 0 },
        { distance: 5, distanceUnit: "km", timeSeconds: 1500 }, // 5:00/km
        { distance: 10, distanceUnit: "km", timeSeconds: 3300 }, // next 5K at 6:00/km
      ]);
      expect(segments).toHaveLength(2);
      expect(segments[0].paceSecondsPerUnit).toBeCloseTo(300, 5);
      expect(segments[1].paceSecondsPerUnit).toBeCloseTo(360, 5);
    });

    it("skips a segment when distance or time does not increase", () => {
      const segments = calculateMultipointSegments([
        { distance: 5, distanceUnit: "km", timeSeconds: 1500 },
        { distance: 5, distanceUnit: "km", timeSeconds: 1800 },
        { distance: 10, distanceUnit: "km", timeSeconds: 3300 },
      ]);
      expect(segments).toHaveLength(1);
      expect(segments[0].fromIndex).toBe(1);
      expect(segments[0].toIndex).toBe(2);
    });

    it("converts mixed units to km before computing a segment", () => {
      const segments = calculateMultipointSegments([
        { distance: 0, distanceUnit: "mi", timeSeconds: 0 },
        { distance: 1, distanceUnit: "mi", timeSeconds: 480 }, // 8:00/mi
      ]);
      expect(segments[0].segmentDistance).toBeCloseTo(1.609344, 5);
    });
  });

  describe("predictFinishTimeSeconds (Riegel formula)", () => {
    it("predicts a slower-than-linear marathon time from a known 10K time", () => {
      const tenKSeconds = secondsFromParts(0, 45, 0); // 45:00 10K
      const predicted = predictFinishTimeSeconds(10, tenKSeconds, 42.195);
      // Linear scaling would give 45:00 * 4.2195 = 189:52 (3:09:52); Riegel's 1.06 exponent
      // predicts a slightly longer time to account for endurance fatigue over the extra distance.
      expect(predicted).toBeGreaterThan(tenKSeconds * (42.195 / 10));
      expect(predicted / 60).toBeGreaterThan(200);
      expect(predicted / 60).toBeLessThan(215);
    });

    it("returns the known time unchanged when target distance equals known distance", () => {
      expect(predictFinishTimeSeconds(5, 1500, 5)).toBeCloseTo(1500, 5);
    });

    it("returns 0 for non-positive inputs", () => {
      expect(predictFinishTimeSeconds(0, 1500, 10)).toBe(0);
      expect(predictFinishTimeSeconds(5, 0, 10)).toBe(0);
      expect(predictFinishTimeSeconds(5, 1500, 0)).toBe(0);
    });
  });

  describe("formatClock", () => {
    it("formats sub-hour durations as m:ss", () => {
      expect(formatClock(325)).toBe("5:25");
    });

    it("formats hour-plus durations as h:mm:ss", () => {
      expect(formatClock(3725)).toBe("1:02:05");
    });
  });
});
