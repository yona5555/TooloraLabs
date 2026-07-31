import { describe, it, expect } from "vitest";
import { BreakEvenCalculator } from "../BreakEvenCalculator";

const context = { locale: "en-US" };
const tool = new BreakEvenCalculator();

describe("BreakEvenCalculator", () => {
  it("computes break-even units and revenue", () => {
    const r = tool.execute(
      { fixedCosts: 10000, variableCostPerUnit: 20, pricePerUnit: 50 },
      context
    );
    expect(r.success).toBe(true);
    expect(r.data.contributionMarginPerUnit).toBe(30);
    expect(r.data.breakEvenUnits).toBe(334);
    expect(r.data.breakEvenRevenue).toBe(16700);
    expect(r.data.contributionMarginRatio).toBe(60);
  });

  it("rounds break-even units up to a whole unit", () => {
    const r = tool.execute(
      { fixedCosts: 1000, variableCostPerUnit: 10, pricePerUnit: 40 },
      context
    );
    expect(r.data.breakEvenUnits).toBe(34);
  });

  it("handles zero fixed costs", () => {
    const r = tool.execute(
      { fixedCosts: 0, variableCostPerUnit: 10, pricePerUnit: 25 },
      context
    );
    expect(r.data.breakEvenUnits).toBe(0);
    expect(r.data.breakEvenRevenue).toBe(0);
  });

  it("returns a failure for negative fixed costs", () => {
    const r = tool.execute(
      { fixedCosts: -1, variableCostPerUnit: 10, pricePerUnit: 25 },
      context
    );
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("INVALID_FIXED_COSTS");
  });

  it("returns a failure when price does not exceed variable cost", () => {
    const r = tool.execute(
      { fixedCosts: 1000, variableCostPerUnit: 30, pricePerUnit: 30 },
      context
    );
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("NO_BREAK_EVEN");
  });

  it("returns a failure when price is below variable cost", () => {
    const r = tool.execute(
      { fixedCosts: 1000, variableCostPerUnit: 40, pricePerUnit: 30 },
      context
    );
    expect(r.success).toBe(false);
    expect(r.metadata.error).toBe("NO_BREAK_EVEN");
  });
});
