import { describe, it, expect } from "vitest";
import { buildDigitTower, classifyDigits, plainDecimalString } from "../SignificantFiguresDigits";
import { countSignificantFigures } from "../SignificantFiguresCalculator";

const roles = (raw: string) => classifyDigits(raw).map((d) => d.role[0]).join("");

describe("classifyDigits", () => {
  it("marks leading, trailing and significant digits", () => {
    expect(roles("0.00500")).toBe("lllsss");
    expect(roles("12300")).toBe("ssstt");
    expect(roles("12300.")).toBe("sssss");
    expect(roles("1002")).toBe("ssss");
    expect(roles("0.00")).toBe("lss");
    expect(roles("abc")).toBe("");
  });
  it("agrees with countSignificantFigures", () => {
    for (const raw of ["0.00500", "12345", "100", "100.", "-4.50", "0.0", "7", "1.000", "0", "000"]) {
      expect(classifyDigits(raw).filter((d) => d.role === "significant").length).toBe(countSignificantFigures(raw));
    }
  });
  it("assigns place values", () => {
    expect(classifyDigits("12.34").map((d) => d.place)).toEqual([1, 0, -1, -2]);
  });
});

describe("buildDigitTower", () => {
  it("drops digits past N significant figures", () => {
    const t = buildDigitTower("12345", { sigFigs: 3 });
    expect(t.digits.map((d) => d.kept)).toEqual([true, true, true, false, false]);
    expect(t.decidingDigit).toBe(4);
    expect(t.roundsUp).toBe(false);
    expect(t.droppedCount).toBe(2);
  });
  it("drops digits past N decimal places", () => {
    const t = buildDigitTower("12.734", { decimalPlaces: 1 });
    expect(t.digits.filter((d) => !d.kept).map((d) => d.digit)).toEqual(["3", "4"]);
    expect(t.decidingDigit).toBe(3);
    expect(t.pointAfter).toBe(1);
  });
  it("keeps everything when counting", () => {
    const t = buildDigitTower("-0.050", null);
    expect(t.sign).toBe("-");
    expect(t.droppedCount).toBe(0);
    expect(t.significantCount).toBe(2);
  });
  it("rounds up on 5 or more", () => {
    expect(buildDigitTower("2.4567", { sigFigs: 2 }).roundsUp).toBe(true);
  });
});

describe("plainDecimalString", () => {
  it("never uses exponential notation", () => {
    expect(plainDecimalString(1 / 3)).toBe("0.333333333333");
    expect(plainDecimalString(1.5e-8)).toBe("0.000000015");
    expect(plainDecimalString(2e21)).toBe("2000000000000000000000");
    expect(plainDecimalString(0)).toBe("0");
  });
});
