import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type OhmsLawKnownPair = "VI" | "VR" | "IR" | "VP" | "IP" | "RP";

export type OhmsLawCalculatorInput = {
  knownPair: OhmsLawKnownPair;
  voltage: number;
  current: number;
  resistance: number;
  power: number;
};

export type OhmsLawCalculatorError = "zero-current" | "zero-resistance" | "zero-voltage" | "zero-power";

export type OhmsLawCalculatorOutput = {
  error: OhmsLawCalculatorError | null;
  voltage: number;
  current: number;
  resistance: number;
  power: number;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

export class OhmsLawCalculator extends BaseCalculator<OhmsLawCalculatorInput, OhmsLawCalculatorOutput> {
  metadata = {
    id: "ohms-law-calculator",
    slug: "ohms-law-calculator",
    name: "Ohm's Law Calculator",
    category: "math-science",
    description: "Solve for voltage, current, resistance, and power from any two known electrical quantities.",
    version: "1.0.0",
  };

  execute(input: OhmsLawCalculatorInput, _context: ToolContext): ToolResult<OhmsLawCalculatorOutput> {
    const { knownPair, voltage, current, resistance, power } = input;

    switch (knownPair) {
      case "VI": {
        if (current === 0) return this.errorResult("zero-current");
        return this.ok({ voltage, current, resistance: voltage / current, power: voltage * current });
      }
      case "VR": {
        if (resistance === 0) return this.errorResult("zero-resistance");
        return this.ok({ voltage, current: voltage / resistance, resistance, power: (voltage * voltage) / resistance });
      }
      case "IR": {
        return this.ok({ voltage: current * resistance, current, resistance, power: current * current * resistance });
      }
      case "VP": {
        if (voltage === 0) return this.errorResult("zero-voltage");
        if (power === 0) return this.errorResult("zero-power");
        return this.ok({ voltage, current: power / voltage, resistance: (voltage * voltage) / power, power });
      }
      case "IP": {
        if (current === 0) return this.errorResult("zero-current");
        if (power === 0) return this.errorResult("zero-power");
        return this.ok({ voltage: power / current, current, resistance: power / (current * current), power });
      }
      case "RP": {
        if (resistance === 0) return this.errorResult("zero-resistance");
        return this.ok({
          voltage: Math.sqrt(power * resistance),
          current: Math.sqrt(power / resistance),
          resistance,
          power,
        });
      }
    }
  }

  private ok(data: Omit<OhmsLawCalculatorOutput, "error">): ToolResult<OhmsLawCalculatorOutput> {
    return {
      success: true,
      data: {
        error: null,
        voltage: clean(data.voltage),
        current: clean(data.current),
        resistance: clean(data.resistance),
        power: clean(data.power),
      },
      metadata: {},
    };
  }

  private errorResult(error: OhmsLawCalculatorError): ToolResult<OhmsLawCalculatorOutput> {
    return {
      success: true,
      data: { error, voltage: 0, current: 0, resistance: 0, power: 0 },
      metadata: {},
    };
  }
}
