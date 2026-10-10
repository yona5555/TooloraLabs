import { describe, expect, it } from "vitest";
import {
  toPlainDecimal,
  decimalShift,
  eNotation,
  siPrefixForm,
  countSigFigs,
  nearestLadderReference,
  clampLadder,
  LADDER_REFERENCES,
  FAMOUS_CONSTANTS,
} from "../ScientificNotationForms";

describe("toPlainDecimal", () => {
  it("expands without e-notation", () => {
    expect(toPlainDecimal(2.99792458, 8)).toBe("299792458");
    expect(toPlainDecimal(1, -15)).toBe("0.000000000000001");
    expect(toPlainDecimal(4.2, -4)).toBe("0.00042");
    expect(toPlainDecimal(-6.02, 3)).toBe("-6020");
    expect(toPlainDecimal(1.5, 0)).toBe("1.5");
    expect(toPlainDecimal(0, 5)).toBe("0");
  });
});

describe("decimalShift", () => {
  it("counts places left for big numbers", () => {
    const s = decimalShift(2.99792458, 8);
    expect(s.digits.join("")).toBe("299792458");
    expect([s.fromIndex, s.toIndex, s.places, s.direction]).toEqual([9, 1, 8, "left"]);
  });
  it("counts places right for small numbers", () => {
    const s = decimalShift(4.2, -4);
    expect(s.digits.join("")).toBe("000042");
    expect([s.fromIndex, s.toIndex, s.places, s.direction]).toEqual([1, 5, 4, "right"]);
  });
  it("no shift between 1 and 10", () => {
    expect(decimalShift(7.5, 0).direction).toBe("none");
  });
});

describe("forms", () => {
  it("e-notation and SI prefix", () => {
    expect(eNotation({ coefficient: 2.99792458, exponent: 8 })).toBe("2.99792458e8");
    expect(siPrefixForm({ coefficient: 299.792458, exponent: 6 })?.prefix.symbol).toBe("M");
    expect(siPrefixForm({ coefficient: 1.2, exponent: -30 })?.prefix.name).toBe("quecto");
    expect(siPrefixForm({ coefficient: 1, exponent: 33 })).toBeNull();
  });
  it("significant figures", () => {
    expect(countSigFigs("299792458")).toEqual({ count: 9, ambiguous: false });
    expect(countSigFigs("0.00420")).toEqual({ count: 3, ambiguous: false });
    expect(countSigFigs("1500")).toEqual({ count: 2, ambiguous: true });
    expect(countSigFigs("1500.")).toEqual({ count: 4, ambiguous: false });
    expect(countSigFigs("6.02e23")).toEqual({ count: 3, ambiguous: false });
  });
});

describe("ladder", () => {
  it("has one reference per main power within range", () => {
    for (const r of LADDER_REFERENCES) expect(r.coefficient >= 1 && r.coefficient < 10).toBe(true);
    expect(LADDER_REFERENCES.map((r) => r.exponent)).toEqual([-15, -12, -9, -6, -3, 0, 2, 6, 9, 12, 15]);
  });
  it("finds the nearest reference and ratio", () => {
    const { ref, ratio } = nearestLadderReference({ coefficient: 2.99792458, exponent: 8 });
    expect(ref.key).toBe("sun");
    expect(ratio).toBeCloseTo(0.21537, 4);
  });
  it("clamps", () => {
    expect(clampLadder(23)).toBe(15);
    expect(clampLadder(-34)).toBe(-15);
  });
  it("constants are normalized", () => {
    for (const c of FAMOUS_CONSTANTS) expect(c.coefficient >= 1 && c.coefficient < 10).toBe(true);
  });
});
