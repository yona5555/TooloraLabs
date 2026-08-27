import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type MolarityMode = "concentration" | "dilution";
export type ConcentrationBasis = "moles" | "mass";
export type DilutionSolveFor = "c1" | "v1" | "c2" | "v2";

export type MolarityCalculatorInput = {
  mode: MolarityMode;
  concentrationBasis: ConcentrationBasis;
  moles: number;
  massGrams: number;
  molarMass: number;
  volumeLiters: number;
  dilutionSolveFor: DilutionSolveFor;
  c1: number;
  v1: number;
  c2: number;
  v2: number;
};

export type MolarityCalculatorError = "zero-volume" | "zero-molar-mass" | "zero-denominator";

export type MolarityCalculatorOutput = {
  error: MolarityCalculatorError | null;
  moles: number;
  molarity: number;
  c1: number;
  v1: number;
  c2: number;
  v2: number;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

export class MolarityCalculator extends BaseCalculator<MolarityCalculatorInput, MolarityCalculatorOutput> {
  metadata = {
    id: "molarity-calculator",
    slug: "molarity-calculator",
    name: "Molarity & Dilution Calculator",
    category: "math-science",
    description: "Calculate molar concentration from moles or mass, or solve dilution problems with C1V1 = C2V2.",
    version: "1.0.0",
  };

  execute(input: MolarityCalculatorInput, _context: ToolContext): ToolResult<MolarityCalculatorOutput> {
    if (input.mode === "concentration") {
      return this.executeConcentration(input);
    }
    return this.executeDilution(input);
  }

  private executeConcentration(input: MolarityCalculatorInput): ToolResult<MolarityCalculatorOutput> {
    const { concentrationBasis, moles, massGrams, molarMass, volumeLiters } = input;

    if (volumeLiters <= 0) {
      return this.errorResult("zero-volume");
    }

    let resultMoles = moles;
    if (concentrationBasis === "mass") {
      if (molarMass <= 0) {
        return this.errorResult("zero-molar-mass");
      }
      resultMoles = massGrams / molarMass;
    }

    return this.ok({
      moles: resultMoles,
      molarity: resultMoles / volumeLiters,
      c1: 0,
      v1: 0,
      c2: 0,
      v2: 0,
    });
  }

  private executeDilution(input: MolarityCalculatorInput): ToolResult<MolarityCalculatorOutput> {
    const { dilutionSolveFor, c1, v1, c2, v2 } = input;

    let resultC1 = c1;
    let resultV1 = v1;
    let resultC2 = c2;
    let resultV2 = v2;

    switch (dilutionSolveFor) {
      case "c1": {
        if (v1 === 0) return this.errorResult("zero-denominator");
        resultC1 = (c2 * v2) / v1;
        break;
      }
      case "v1": {
        if (c1 === 0) return this.errorResult("zero-denominator");
        resultV1 = (c2 * v2) / c1;
        break;
      }
      case "c2": {
        if (v2 === 0) return this.errorResult("zero-denominator");
        resultC2 = (c1 * v1) / v2;
        break;
      }
      case "v2": {
        if (c2 === 0) return this.errorResult("zero-denominator");
        resultV2 = (c1 * v1) / c2;
        break;
      }
    }

    return this.ok({
      moles: 0,
      molarity: 0,
      c1: resultC1,
      v1: resultV1,
      c2: resultC2,
      v2: resultV2,
    });
  }

  private ok(data: Omit<MolarityCalculatorOutput, "error">): ToolResult<MolarityCalculatorOutput> {
    return {
      success: true,
      data: {
        error: null,
        moles: clean(data.moles),
        molarity: clean(data.molarity),
        c1: clean(data.c1),
        v1: clean(data.v1),
        c2: clean(data.c2),
        v2: clean(data.v2),
      },
      metadata: {},
    };
  }

  private errorResult(error: MolarityCalculatorError): ToolResult<MolarityCalculatorOutput> {
    return {
      success: true,
      data: { error, moles: 0, molarity: 0, c1: 0, v1: 0, c2: 0, v2: 0 },
      metadata: {},
    };
  }
}
