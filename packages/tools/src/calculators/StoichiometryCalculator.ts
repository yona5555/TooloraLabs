import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import { computeMolarMass } from "./MolarMassCalculator";

export type AmountUnit = "grams" | "moles";

export type StoichiometryCalculatorInput = {
  knownFormula: string;
  knownCoefficient: number;
  knownAmount: number;
  knownUnit: AmountUnit;
  targetFormula: string;
  targetCoefficient: number;
  targetUnit: AmountUnit;
};

export type StoichiometryCalculatorError =
  | "invalid-known-formula"
  | "invalid-target-formula"
  | "invalid-coefficient"
  | "invalid-amount";

export type StoichiometryCalculatorOutput = {
  error: StoichiometryCalculatorError | null;
  errorDetail: string | null;
  knownMolarMass: number;
  targetMolarMass: number;
  knownMoles: number;
  targetMoles: number;
  targetAmount: number;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

/**
 * Converts a known amount of one substance in a balanced chemical equation
 * into the equivalent amount of another substance, using the mole ratio
 * given by the two (already-balanced) stoichiometric coefficients:
 * moles(target) = moles(known) x (targetCoefficient / knownCoefficient).
 * Molar masses (needed only when a side is given/wanted in grams) are
 * computed by parsing each formula the same way MolarMassCalculator does.
 */
export class StoichiometryCalculator extends BaseCalculator<StoichiometryCalculatorInput, StoichiometryCalculatorOutput> {
  metadata = {
    id: "stoichiometry-calculator",
    slug: "stoichiometry-calculator",
    name: "Stoichiometry Calculator",
    category: "math-science",
    description: "Convert between moles or grams of two substances in a balanced chemical equation using mole-ratio stoichiometry.",
    version: "1.0.0",
  };

  execute(input: StoichiometryCalculatorInput, _context: ToolContext): ToolResult<StoichiometryCalculatorOutput> {
    const { knownFormula, knownCoefficient, knownAmount, knownUnit, targetFormula, targetCoefficient, targetUnit } = input;

    if (!(knownCoefficient > 0) || !(targetCoefficient > 0)) {
      return this.errorResult("invalid-coefficient", "Stoichiometric coefficients must be greater than zero.");
    }
    if (!(knownAmount >= 0)) {
      return this.errorResult("invalid-amount", "Enter a known amount of zero or more.");
    }

    const knownLookup = computeMolarMass(knownFormula);
    if (knownLookup.error) {
      return this.errorResult("invalid-known-formula", knownLookup.errorDetail);
    }
    const targetLookup = computeMolarMass(targetFormula);
    if (targetLookup.error) {
      return this.errorResult("invalid-target-formula", targetLookup.errorDetail);
    }

    const knownMolarMass = knownLookup.totalMass;
    const targetMolarMass = targetLookup.totalMass;

    const knownMoles = knownUnit === "moles" ? knownAmount : knownAmount / knownMolarMass;
    const targetMoles = knownMoles * (targetCoefficient / knownCoefficient);
    const targetAmount = targetUnit === "moles" ? targetMoles : targetMoles * targetMolarMass;

    return this.ok({ knownMolarMass, targetMolarMass, knownMoles, targetMoles, targetAmount });
  }

  private ok(data: Omit<StoichiometryCalculatorOutput, "error" | "errorDetail">): ToolResult<StoichiometryCalculatorOutput> {
    return {
      success: true,
      data: {
        error: null,
        errorDetail: null,
        knownMolarMass: clean(data.knownMolarMass),
        targetMolarMass: clean(data.targetMolarMass),
        knownMoles: clean(data.knownMoles),
        targetMoles: clean(data.targetMoles),
        targetAmount: clean(data.targetAmount),
      },
      metadata: {},
    };
  }

  private errorResult(error: StoichiometryCalculatorError, detail: string): ToolResult<StoichiometryCalculatorOutput> {
    return {
      success: true,
      data: { error, errorDetail: detail, knownMolarMass: 0, targetMolarMass: 0, knownMoles: 0, targetMoles: 0, targetAmount: 0 },
      metadata: {},
    };
  }
}
