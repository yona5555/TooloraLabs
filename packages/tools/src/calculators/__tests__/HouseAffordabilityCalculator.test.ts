import { describe, it, expect } from "vitest";
import { calculateHouseAffordability, calculateRequiredIncome } from "../HouseAffordabilityCalculator";

describe("calculateHouseAffordability", () => {
  it("caps the housing budget at 28% of gross income when that is the binding constraint", () => {
    const result = calculateHouseAffordability(90000, 400, 40000, 6.5, 30, 1.2, 1500, 0);
    expect(result.maxHomePrice).toBeCloseTo(304319.7, 0);
    expect(result.loanAmount).toBeCloseTo(264319.7, 0);
    expect(result.monthlyPayment).toBeCloseTo(2100, 1);
  });

  it("accounts for HOA dues and produces a higher max price with a bigger budget", () => {
    const result = calculateHouseAffordability(120000, 600, 60000, 7, 30, 1.5, 1800, 50);
    expect(result.maxHomePrice).toBeCloseTo(379497.92, 1);
    expect(result.monthlyPayment).toBeCloseTo(2800, 1);
  });

  it("caps the housing budget at 36% of gross income minus existing debts when that is the binding constraint", () => {
    const result = calculateHouseAffordability(60000, 1200, 20000, 6, 30, 1.0, 1200, 0);
    expect(result.maxHomePrice).toBeCloseTo(90778.26, 1);
    expect(result.monthlyPayment).toBeCloseTo(600, 1);
  });

  it("splits the monthly payment into principal & interest, tax, and insurance correctly", () => {
    const result = calculateHouseAffordability(90000, 400, 40000, 6.5, 30, 1.2, 1500, 0);
    const sum = result.monthlyPrincipalAndInterest + result.monthlyPropertyTax + result.monthlyInsurance;
    expect(sum).toBeCloseTo(result.monthlyPayment, 5);
  });

  it("returns a zeroed result when existing debts already exceed the 36% back-end limit", () => {
    const result = calculateHouseAffordability(30000, 2000, 10000, 6.5, 30, 1.2, 1200, 0);
    expect(result).toEqual({
      maxHomePrice: 0,
      loanAmount: 0,
      monthlyPayment: 0,
      monthlyPrincipalAndInterest: 0,
      monthlyPropertyTax: 0,
      monthlyInsurance: 0,
    });
  });

  it("returns a zeroed result for invalid inputs", () => {
    expect(calculateHouseAffordability(-1, 400, 40000, 6.5, 30, 1.2, 1500, 0).maxHomePrice).toBe(0);
    expect(calculateHouseAffordability(90000, -1, 40000, 6.5, 30, 1.2, 1500, 0).maxHomePrice).toBe(0);
    expect(calculateHouseAffordability(90000, 400, -1, 6.5, 30, 1.2, 1500, 0).maxHomePrice).toBe(0);
    expect(calculateHouseAffordability(90000, 400, 40000, -1, 30, 1.2, 1500, 0).maxHomePrice).toBe(0);
    expect(calculateHouseAffordability(90000, 400, 40000, 6.5, 0, 1.2, 1500, 0).maxHomePrice).toBe(0);
    expect(calculateHouseAffordability(90000, 400, 40000, 6.5, 30, -1, 1500, 0).maxHomePrice).toBe(0);
    expect(calculateHouseAffordability(90000, 400, 40000, 6.5, 30, 1.2, -1, 0).maxHomePrice).toBe(0);
    expect(calculateHouseAffordability(90000, 400, 40000, 6.5, 30, 1.2, 1500, -1).maxHomePrice).toBe(0);
  });
});

describe("calculateRequiredIncome", () => {
  it("is the exact inverse of calculateHouseAffordability (round trip)", () => {
    const forward = calculateHouseAffordability(90000, 400, 40000, 6.5, 30, 1.2, 1500, 0);
    const reverse = calculateRequiredIncome(forward.maxHomePrice, 400, 40000, 6.5, 30, 1.2, 1500, 0);
    expect(reverse.requiredAnnualIncome).toBeCloseTo(90000, 0);
  });

  it("round-trips correctly when the front-end (28%) ratio is the binding constraint", () => {
    // Low debts, so the 28% housing-only limit binds before the 36% total-debt limit does.
    const forward = calculateHouseAffordability(90000, 100, 40000, 6.5, 30, 1.2, 1500, 0);
    expect(forward.maxHomePrice).toBeGreaterThan(0);
    const reverse = calculateRequiredIncome(forward.maxHomePrice, 100, 40000, 6.5, 30, 1.2, 1500, 0);
    expect(reverse.requiredAnnualIncome).toBeCloseTo(90000, 0);
    expect(reverse.bindingConstraint).toBe("frontEnd");
  });

  it("round-trips correctly when the back-end (36%) ratio is the binding constraint", () => {
    // High existing debts push the 36% total-debt limit below the 28% housing-only limit.
    const forward = calculateHouseAffordability(90000, 1800, 40000, 6.5, 30, 1.2, 1500, 0);
    expect(forward.maxHomePrice).toBeGreaterThan(0);
    const reverse = calculateRequiredIncome(forward.maxHomePrice, 1800, 40000, 6.5, 30, 1.2, 1500, 0);
    expect(reverse.requiredAnnualIncome).toBeCloseTo(90000, 0);
    expect(reverse.bindingConstraint).toBe("backEnd");
  });

  it("returns zeros for invalid inputs", () => {
    expect(calculateRequiredIncome(0, 400, 40000, 6.5, 30, 1.2, 1500, 0).requiredAnnualIncome).toBe(0);
    expect(calculateRequiredIncome(300000, 400, 300000, 6.5, 30, 1.2, 1500, 0).requiredAnnualIncome).toBe(0);
    expect(calculateRequiredIncome(300000, -1, 40000, 6.5, 30, 1.2, 1500, 0).requiredAnnualIncome).toBe(0);
    expect(calculateRequiredIncome(300000, 400, 40000, 6.5, 0, 1.2, 1500, 0).requiredAnnualIncome).toBe(0);
  });
});
