import { describe, it, expect } from "vitest";
import {
  getLifeStage,
  getLifeExpectancyYears,
  computeLifeExpectancyProgress,
} from "../AgeCalculator";

describe("getLifeStage", () => {
  it("classifies childhood (0-9)", () => {
    expect(getLifeStage(0)).toBe("childhood");
    expect(getLifeStage(5)).toBe("childhood");
    expect(getLifeStage(9)).toBe("childhood");
  });

  it("classifies adolescence (10-19), matching WHO's definition", () => {
    expect(getLifeStage(10)).toBe("adolescence");
    expect(getLifeStage(15)).toBe("adolescence");
    expect(getLifeStage(19)).toBe("adolescence");
  });

  it("classifies youth / young adulthood (20-39)", () => {
    expect(getLifeStage(20)).toBe("youth");
    expect(getLifeStage(30)).toBe("youth");
    expect(getLifeStage(39)).toBe("youth");
  });

  it("classifies middle age (40-59)", () => {
    expect(getLifeStage(40)).toBe("middleAge");
    expect(getLifeStage(50)).toBe("middleAge");
    expect(getLifeStage(59)).toBe("middleAge");
  });

  it("classifies old age (60+), matching WHO's 'older person' threshold", () => {
    expect(getLifeStage(60)).toBe("oldAge");
    expect(getLifeStage(85)).toBe("oldAge");
    expect(getLifeStage(120)).toBe("oldAge");
  });

  it("has no gaps or overlaps across a full lifespan", () => {
    for (let age = 0; age <= 130; age++) {
      expect(() => getLifeStage(age)).not.toThrow();
      expect(getLifeStage(age)).toBeTruthy();
    }
  });

  it("clamps negative ages to childhood instead of throwing", () => {
    expect(getLifeStage(-5)).toBe("childhood");
  });
});

describe("getLifeExpectancyYears", () => {
  it("returns the World Bank/UN World Population Prospects figures by sex", () => {
    expect(getLifeExpectancyYears("male")).toBe(70.9);
    expect(getLifeExpectancyYears("female")).toBe(75.8);
  });

  it("gives females a higher figure than males, matching the real-world gap", () => {
    expect(getLifeExpectancyYears("female")).toBeGreaterThan(getLifeExpectancyYears("male"));
  });
});

describe("computeLifeExpectancyProgress", () => {
  it("handles age zero: 0% elapsed, childhood, full life expectancy remaining", () => {
    const male = computeLifeExpectancyProgress(0, "male");
    expect(male.percentElapsed).toBe(0);
    expect(male.lifeStage).toBe("childhood");
    expect(male.isPastLifeExpectancy).toBe(false);
    expect(male.yearsRemaining).toBeCloseTo(70.9, 5);
    expect(male.daysRemaining).toBeGreaterThan(25000);

    const female = computeLifeExpectancyProgress(0, "female");
    expect(female.percentElapsed).toBe(0);
    expect(female.yearsRemaining).toBeCloseTo(75.8, 5);
  });

  it("clamps an age past life expectancy to 100% elapsed with nothing remaining", () => {
    const result = computeLifeExpectancyProgress(120, "male");
    expect(result.isPastLifeExpectancy).toBe(true);
    expect(result.percentElapsed).toBe(100);
    expect(result.yearsRemaining).toBe(0);
    expect(result.daysRemaining).toBe(0);
    expect(result.weeksRemaining).toBe(0);
    expect(result.monthsRemaining).toBe(0);
    expect(result.lifeStage).toBe("oldAge");
  });

  it("flags exactly-at-life-expectancy as past, not still-remaining", () => {
    const le = getLifeExpectancyYears("female");
    const result = computeLifeExpectancyProgress(le, "female");
    expect(result.isPastLifeExpectancy).toBe(true);
    expect(result.percentElapsed).toBe(100);
  });

  it("produces a different percentage for the same age depending on sex", () => {
    const male = computeLifeExpectancyProgress(40, "male");
    const female = computeLifeExpectancyProgress(40, "female");
    expect(male.percentElapsed).not.toBe(female.percentElapsed);
    // Same numerator (40), larger denominator (female LE) -> smaller percentage.
    expect(female.percentElapsed).toBeLessThan(male.percentElapsed);
  });

  it("keeps remaining-time figures internally consistent", () => {
    const result = computeLifeExpectancyProgress(30, "male");
    expect(result.weeksRemaining).toBeCloseTo(result.daysRemaining / 7, 0);
    expect(result.monthsRemaining).toBeCloseTo(result.yearsRemaining * 12, 0);
  });

  it("reports the mid-range life stage consistently with getLifeStage", () => {
    const result = computeLifeExpectancyProgress(45, "female");
    expect(result.lifeStage).toBe(getLifeStage(45));
    expect(result.lifeStage).toBe("middleAge");
  });

  it("treats a negative age the same as zero", () => {
    const result = computeLifeExpectancyProgress(-3, "male");
    expect(result.percentElapsed).toBe(0);
    expect(result.isPastLifeExpectancy).toBe(false);
    expect(result.lifeStage).toBe("childhood");
  });
});
