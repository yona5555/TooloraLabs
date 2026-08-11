import { describe, it, expect } from "vitest";
import { PercentageCalculator } from "../PercentageCalculator";

const context = { locale: "en-US" };
const calc = new PercentageCalculator();

describe("PercentageCalculator", () => {
  it("computes X% of Y", () => {
    const r = calc.execute({ mode: "percent-of-number", first: 20, second: 50 }, context);
    expect(r.data.value).toBe(10);
  });

  it("computes what percent X is of Y", () => {
    const r = calc.execute({ mode: "what-percent", first: 10, second: 50 }, context);
    expect(r.data.value).toBe(20);
  });

  it("handles division by zero in what-percent", () => {
    const r = calc.execute({ mode: "what-percent", first: 10, second: 0 }, context);
    expect(r.data.text).toBe("Division by zero is not allowed.");
  });

  it("computes percentage change", () => {
    const r = calc.execute({ mode: "percentage-change", first: 50, second: 75 }, context);
    expect(r.data.value).toBe(50);
  });

  it("handles zero original value in percentage-change", () => {
    const r = calc.execute({ mode: "percentage-change", first: 0, second: 75 }, context);
    expect(r.data.text).toBe("Original value cannot be zero.");
  });

  it("computes the base value from a reverse percentage", () => {
    const r = calc.execute({ mode: "reverse-percentage", first: 20, second: 10 }, context);
    expect(r.data.value).toBe(50);
  });

  it("handles a zero percentage in reverse-percentage", () => {
    const r = calc.execute({ mode: "reverse-percentage", first: 0, second: 10 }, context);
    expect(r.data.text).toBe("Percentage cannot be zero.");
  });

  it("computes the symmetric percentage difference between two values", () => {
    const r = calc.execute({ mode: "percentage-difference", first: 50, second: 75 }, context);
    expect(r.data.value).toBe(40);
  });

  it("handles two zero values in percentage-difference", () => {
    const r = calc.execute({ mode: "percentage-difference", first: 0, second: 0 }, context);
    expect(r.data.text).toBe("Both values cannot be zero.");
  });
});
