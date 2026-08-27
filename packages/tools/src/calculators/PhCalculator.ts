import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type PhOperation = "fromH" | "fromPH" | "fromOH" | "fromPOH";

export type PhCalculatorInput = {
  operation: PhOperation;
  hConcentration: number;
  pH: number;
  ohConcentration: number;
  pOH: number;
};

export type PhCalculatorError = "non-positive-concentration";

export type PhClassification = "acidic" | "neutral" | "basic";

export type PhCalculatorOutput = {
  error: PhCalculatorError | null;
  pH: number;
  pOH: number;
  hConcentration: number;
  ohConcentration: number;
  classification: PhClassification;
};

const KW_EXPONENT = 14;

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

function classify(pH: number): PhClassification {
  if (pH < 7) return "acidic";
  if (pH > 7) return "basic";
  return "neutral";
}

export class PhCalculator extends BaseCalculator<PhCalculatorInput, PhCalculatorOutput> {
  metadata = {
    id: "ph-calculator",
    slug: "ph-calculator",
    name: "pH Calculator",
    category: "math-science",
    description: "Convert between pH, pOH, hydrogen ion concentration, and hydroxide ion concentration for aqueous solutions at 25°C.",
    version: "1.0.0",
  };

  execute(input: PhCalculatorInput, _context: ToolContext): ToolResult<PhCalculatorOutput> {
    const { operation, hConcentration, pH, ohConcentration, pOH } = input;

    let resultPH: number;

    switch (operation) {
      case "fromH": {
        if (hConcentration <= 0) return this.errorResult();
        resultPH = -Math.log10(hConcentration);
        break;
      }
      case "fromPH": {
        resultPH = pH;
        break;
      }
      case "fromOH": {
        if (ohConcentration <= 0) return this.errorResult();
        resultPH = KW_EXPONENT - -Math.log10(ohConcentration);
        break;
      }
      case "fromPOH": {
        resultPH = KW_EXPONENT - pOH;
        break;
      }
    }

    const resultPOH = KW_EXPONENT - resultPH;
    const resultH = Math.pow(10, -resultPH);
    const resultOH = Math.pow(10, -resultPOH);

    return {
      success: true,
      data: {
        error: null,
        pH: clean(resultPH),
        pOH: clean(resultPOH),
        hConcentration: clean(resultH),
        ohConcentration: clean(resultOH),
        classification: classify(resultPH),
      },
      metadata: {},
    };
  }

  private errorResult(): ToolResult<PhCalculatorOutput> {
    return {
      success: true,
      data: {
        error: "non-positive-concentration",
        pH: 0,
        pOH: 0,
        hConcentration: 0,
        ohConcentration: 0,
        classification: "neutral",
      },
      metadata: {},
    };
  }
}
