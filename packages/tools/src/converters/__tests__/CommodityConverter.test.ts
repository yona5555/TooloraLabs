import { describe, it, expect } from "vitest";
import {
  convertMetalWeight,
  calculateMetalValue,
  calculateOilValue,
  TROY_OUNCE_IN_GRAMS,
} from "../CommodityConverter";

describe("convertMetalWeight", () => {
  it("converts troy ounces to grams", () => {
    expect(convertMetalWeight(1, "troyOunce", "gram")).toBeCloseTo(31.1034768, 5);
  });

  it("converts grams to troy ounces", () => {
    expect(convertMetalWeight(TROY_OUNCE_IN_GRAMS, "gram", "troyOunce")).toBeCloseTo(1, 5);
  });

  it("returns the same amount when units match", () => {
    expect(convertMetalWeight(50, "gram", "gram")).toBe(50);
  });

  it("returns 0 for non-finite input", () => {
    expect(convertMetalWeight(NaN, "gram", "troyOunce")).toBe(0);
  });
});

describe("calculateMetalValue", () => {
  it("prices 1 troy ounce at the quoted USD price", () => {
    expect(calculateMetalValue(1, "troyOunce", 2000, 1)).toBeCloseTo(2000, 5);
  });

  it("prices grams as a fraction of a troy ounce", () => {
    // 1 gram of gold at $2000/oz -> 2000 / 31.1034768
    expect(calculateMetalValue(1, "gram", 2000, 1)).toBeCloseTo(64.301, 2);
  });

  it("applies the fx rate to convert into another currency", () => {
    // 1 troy ounce at $2000/oz, converted to SAR at 3.75 SAR/USD
    expect(calculateMetalValue(1, "troyOunce", 2000, 3.75)).toBeCloseTo(7500, 5);
  });

  it("returns 0 for negative or non-finite inputs", () => {
    expect(calculateMetalValue(-1, "gram", 2000, 1)).toBe(0);
    expect(calculateMetalValue(1, "gram", -2000, 1)).toBe(0);
    expect(calculateMetalValue(NaN, "gram", 2000, 1)).toBe(0);
  });

  it("allows a zero weight", () => {
    expect(calculateMetalValue(0, "gram", 2000, 1)).toBe(0);
  });
});

describe("calculateOilValue", () => {
  it("multiplies barrels by price and fx rate", () => {
    expect(calculateOilValue(2, 75, 1)).toBeCloseTo(150, 5);
    expect(calculateOilValue(2, 75, 3.75)).toBeCloseTo(562.5, 5);
  });

  it("returns 0 for negative or non-finite inputs", () => {
    expect(calculateOilValue(-1, 75, 1)).toBe(0);
    expect(calculateOilValue(1, -75, 1)).toBe(0);
    expect(calculateOilValue(Infinity, 75, 1)).toBe(0);
  });
});
