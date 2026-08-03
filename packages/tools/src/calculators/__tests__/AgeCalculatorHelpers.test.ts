import { describe, it, expect } from "vitest";
import { getZodiacSign, getChineseZodiac, getGeneration } from "../AgeCalculator";

describe("getZodiacSign", () => {
  it("resolves boundary dates correctly", () => {
    expect(getZodiacSign(1, 19)).toBe("capricorn");
    expect(getZodiacSign(1, 20)).toBe("aquarius");
    expect(getZodiacSign(3, 20)).toBe("pisces");
    expect(getZodiacSign(3, 21)).toBe("aries");
    expect(getZodiacSign(12, 21)).toBe("sagittarius");
    expect(getZodiacSign(12, 22)).toBe("capricorn");
    expect(getZodiacSign(12, 31)).toBe("capricorn");
  });

  it("resolves a mid-range date", () => {
    expect(getZodiacSign(7, 15)).toBe("cancer");
  });
});

describe("getChineseZodiac", () => {
  it("matches the known 2020 Year of the Rat", () => {
    expect(getChineseZodiac(2020)).toBe("rat");
  });

  it("cycles every 12 years", () => {
    expect(getChineseZodiac(2020)).toBe(getChineseZodiac(2032));
    expect(getChineseZodiac(1990)).toBe(getChineseZodiac(2002));
  });

  it("handles years before the reference year", () => {
    expect(getChineseZodiac(2019)).toBe("pig");
  });
});

describe("getGeneration", () => {
  it("classifies each Pew-defined generation", () => {
    expect(getGeneration(1930)).toBe("silentGeneration");
    expect(getGeneration(1950)).toBe("babyBoomer");
    expect(getGeneration(1970)).toBe("generationX");
    expect(getGeneration(1990)).toBe("millennial");
    expect(getGeneration(2005)).toBe("generationZ");
  });

  it("classifies the newer, less-standardized generations", () => {
    expect(getGeneration(2015)).toBe("generationAlpha");
    expect(getGeneration(2026)).toBe("generationBeta");
  });

  it("classifies pre-Silent births as the Greatest Generation", () => {
    expect(getGeneration(1910)).toBe("greatestGeneration");
  });

  it("has no gaps or overlaps across a full century", () => {
    for (let year = 1900; year <= 2030; year++) {
      expect(() => getGeneration(year)).not.toThrow();
      expect(getGeneration(year)).toBeTruthy();
    }
  });
});
