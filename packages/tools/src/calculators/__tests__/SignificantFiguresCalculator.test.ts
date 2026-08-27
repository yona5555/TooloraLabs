import { describe, it, expect } from "vitest";
import {
  SignificantFiguresCalculator,
  countSignificantFigures,
  countDecimalPlaces,
  roundToSigFigs,
} from "../SignificantFiguresCalculator";

const context = { locale: "en-US" };
const calc = new SignificantFiguresCalculator();

describe("countSignificantFigures", () => {
  it("counts all nonzero digits as significant", () => {
    expect(countSignificantFigures("1234")).toBe(4);
  });

  it("does not count trailing zeros without a decimal point", () => {
    expect(countSignificantFigures("100")).toBe(1);
    expect(countSignificantFigures("1200")).toBe(2);
  });

  it("counts trailing zeros as significant when a decimal point is present", () => {
    expect(countSignificantFigures("100.")).toBe(3);
    expect(countSignificantFigures("1.00")).toBe(3);
  });

  it("does not count leading zeros", () => {
    expect(countSignificantFigures("0.0050")).toBe(2);
    expect(countSignificantFigures("0.0102")).toBe(3);
  });

  it("counts zeros sandwiched between nonzero digits", () => {
    expect(countSignificantFigures("1002")).toBe(4);
  });

  it("handles an all-zero decimal as a measured zero", () => {
    expect(countSignificantFigures("0.00")).toBe(2);
  });
});

describe("countDecimalPlaces", () => {
  it("counts digits after the decimal point", () => {
    expect(countDecimalPlaces("12.345")).toBe(3);
  });

  it("returns zero when there is no decimal point", () => {
    expect(countDecimalPlaces("1200")).toBe(0);
  });
});

describe("roundToSigFigs", () => {
  it("rounds a large number to fewer significant figures", () => {
    expect(roundToSigFigs(12345, 2)).toBe(12000);
  });

  it("rounds a small decimal to fewer significant figures", () => {
    expect(roundToSigFigs(0.0034567, 2)).toBeCloseTo(0.0035, 10);
  });

  it("carries a rounding-driven carry into a new digit", () => {
    expect(roundToSigFigs(9.96, 2)).toBe(10);
  });
});

describe("SignificantFiguresCalculator", () => {
  it("counts significant figures in count mode", () => {
    const r = calc.execute({ operation: "count", rawValueA: "0.00500", rawValueB: "", roundToDigits: 0 }, context);
    expect(r.data.sigFigsA).toBe(3);
  });

  it("rounds to a chosen number of significant figures", () => {
    const r = calc.execute({ operation: "round", rawValueA: "12345", rawValueB: "", roundToDigits: 3 }, context);
    expect(r.data.roundedResult).toBe(12300);
    expect(r.data.resultScientific).toEqual({ coefficient: 1.23, exponent: 4 });
  });

  it("rounds addition to the least precise decimal place, not by sig-fig count", () => {
    const r = calc.execute({ operation: "add", rawValueA: "12.5", rawValueB: "0.234", roundToDigits: 0 }, context);
    expect(r.data.resultDecimalPlaces).toBe(1);
    expect(r.data.roundedResult).toBe(12.7);
  });

  it("rounds subtraction to the least precise decimal place", () => {
    const r = calc.execute({ operation: "subtract", rawValueA: "18.0", rawValueB: "2.545", roundToDigits: 0 }, context);
    expect(r.data.resultDecimalPlaces).toBe(1);
    expect(r.data.roundedResult).toBe(15.5);
  });

  it("rounds multiplication to the fewest significant figures of the two inputs", () => {
    const r = calc.execute({ operation: "multiply", rawValueA: "4.5", rawValueB: "2.33", roundToDigits: 0 }, context);
    expect(r.data.resultSigFigs).toBe(2);
    expect(r.data.roundedResult).toBe(10);
  });

  it("rounds division to the fewest significant figures of the two inputs", () => {
    const r = calc.execute({ operation: "divide", rawValueA: "10.0", rawValueB: "3.0", roundToDigits: 0 }, context);
    expect(r.data.resultSigFigs).toBe(2);
    expect(r.data.roundedResult).toBeCloseTo(3.3, 10);
  });

  it("flags division by zero", () => {
    const r = calc.execute({ operation: "divide", rawValueA: "10", rawValueB: "0", roundToDigits: 0 }, context);
    expect(r.data.error).toBe("divide-by-zero");
  });

  it("flags an invalid number", () => {
    const r = calc.execute({ operation: "count", rawValueA: "abc", rawValueB: "", roundToDigits: 0 }, context);
    expect(r.data.error).toBe("invalid-number");
  });
});
