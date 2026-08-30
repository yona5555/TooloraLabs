import { describe, it, expect } from "vitest";
import { calculateDebtToIncome, calculateMaxAllowedDebt } from "../DebtToIncomeCalculator";

describe("calculateDebtToIncome", () => {
  it("categorizes a back-end ratio under 36% as healthy", () => {
    const result = calculateDebtToIncome(6000, 1500, 300, 200, 100, 0);
    expect(result.totalMonthlyDebt).toBe(2100);
    expect(result.frontEndRatio).toBeCloseTo(25, 5);
    expect(result.backEndRatio).toBeCloseTo(35, 5);
    expect(result.category).toBe("healthy");
  });

  it("categorizes a back-end ratio between 36% and 43% as manageable", () => {
    const result = calculateDebtToIncome(5000, 1200, 300, 200, 150, 0);
    expect(result.backEndRatio).toBeCloseTo(37, 5);
    expect(result.category).toBe("manageable");
  });

  it("categorizes a back-end ratio between 43% and 50% as high", () => {
    const result = calculateDebtToIncome(4000, 900, 300, 200, 250, 150);
    expect(result.backEndRatio).toBeCloseTo(45, 5);
    expect(result.category).toBe("high");
  });

  it("categorizes a back-end ratio at or above 50% as veryHigh", () => {
    const result = calculateDebtToIncome(5000, 1800, 400, 300, 200, 100);
    expect(result.backEndRatio).toBeCloseTo(56, 5);
    expect(result.category).toBe("veryHigh");
  });

  it("computes the front-end ratio from housing payment alone", () => {
    const result = calculateDebtToIncome(5000, 1800, 400, 300, 200, 100);
    expect(result.frontEndRatio).toBeCloseTo(36, 5);
  });

  it("returns a zeroed, healthy-category result for invalid inputs", () => {
    expect(calculateDebtToIncome(0, 1500, 300, 200, 100, 0)).toEqual({
      totalMonthlyDebt: 0,
      frontEndRatio: 0,
      backEndRatio: 0,
      category: "healthy",
    });
    expect(calculateDebtToIncome(-1, 1500, 300, 200, 100, 0).totalMonthlyDebt).toBe(0);
    expect(calculateDebtToIncome(6000, -1, 300, 200, 100, 0).totalMonthlyDebt).toBe(0);
    expect(calculateDebtToIncome(6000, 1500, -1, 200, 100, 0).totalMonthlyDebt).toBe(0);
    expect(calculateDebtToIncome(6000, 1500, 300, -1, 100, 0).totalMonthlyDebt).toBe(0);
    expect(calculateDebtToIncome(6000, 1500, 300, 200, -1, 0).totalMonthlyDebt).toBe(0);
    expect(calculateDebtToIncome(6000, 1500, 300, 200, 100, -1).totalMonthlyDebt).toBe(0);
  });
});

describe("calculateMaxAllowedDebt", () => {
  it("is the exact inverse of calculateDebtToIncome's back-end ratio", () => {
    const forward = calculateDebtToIncome(6000, 1500, 300, 200, 100, 0);
    const reverse = calculateMaxAllowedDebt(6000, forward.backEndRatio, 0);
    expect(reverse.maxTotalMonthlyDebt).toBeCloseTo(forward.totalMonthlyDebt, 5);
  });

  it("computes the max total monthly debt a target ratio allows", () => {
    const result = calculateMaxAllowedDebt(6000, 36, 0);
    expect(result.maxTotalMonthlyDebt).toBeCloseTo(2160, 5);
  });

  it("subtracts existing non-housing debt to find remaining room", () => {
    const result = calculateMaxAllowedDebt(6000, 36, 600);
    expect(result.maxTotalMonthlyDebt).toBeCloseTo(2160, 5);
    expect(result.maxAdditionalMonthlyDebt).toBeCloseTo(1560, 5);
  });

  it("floors additional debt at zero when existing debt already exceeds the target", () => {
    const result = calculateMaxAllowedDebt(6000, 20, 2000);
    expect(result.maxAdditionalMonthlyDebt).toBe(0);
  });

  it("returns zeros for invalid inputs", () => {
    expect(calculateMaxAllowedDebt(0, 36, 0).maxTotalMonthlyDebt).toBe(0);
    expect(calculateMaxAllowedDebt(6000, -1, 0).maxTotalMonthlyDebt).toBe(0);
    expect(calculateMaxAllowedDebt(6000, 36, -1).maxTotalMonthlyDebt).toBe(0);
  });
});
