import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type GasLawSolveFor = "pressure" | "volume" | "moles" | "temperature";

export type IdealGasLawCalculatorInput = {
  solveFor: GasLawSolveFor;
  pressureAtm: number;
  volumeLiters: number;
  moles: number;
  temperatureKelvin: number;
};

export type IdealGasLawCalculatorError = "zero-volume" | "zero-pressure" | "zero-temperature" | "zero-moles";

export type IdealGasLawCalculatorOutput = {
  error: IdealGasLawCalculatorError | null;
  pressureAtm: number;
  volumeLiters: number;
  moles: number;
  temperatureKelvin: number;
};

const R = 0.0820574;

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

export class IdealGasLawCalculator extends BaseCalculator<IdealGasLawCalculatorInput, IdealGasLawCalculatorOutput> {
  metadata = {
    id: "ideal-gas-law-calculator",
    slug: "ideal-gas-law-calculator",
    name: "Ideal Gas Law Calculator",
    category: "math-science",
    description: "Solve for pressure, volume, moles, or temperature using the ideal gas law, PV = nRT.",
    version: "1.0.0",
  };

  execute(input: IdealGasLawCalculatorInput, _context: ToolContext): ToolResult<IdealGasLawCalculatorOutput> {
    const { solveFor, pressureAtm, volumeLiters, moles, temperatureKelvin } = input;

    switch (solveFor) {
      case "pressure": {
        if (volumeLiters <= 0) return this.errorResult("zero-volume");
        return this.ok({ pressureAtm: (moles * R * temperatureKelvin) / volumeLiters, volumeLiters, moles, temperatureKelvin });
      }
      case "volume": {
        if (pressureAtm <= 0) return this.errorResult("zero-pressure");
        return this.ok({ pressureAtm, volumeLiters: (moles * R * temperatureKelvin) / pressureAtm, moles, temperatureKelvin });
      }
      case "moles": {
        if (temperatureKelvin <= 0) return this.errorResult("zero-temperature");
        return this.ok({ pressureAtm, volumeLiters, moles: (pressureAtm * volumeLiters) / (R * temperatureKelvin), temperatureKelvin });
      }
      case "temperature": {
        if (moles <= 0) return this.errorResult("zero-moles");
        return this.ok({ pressureAtm, volumeLiters, moles, temperatureKelvin: (pressureAtm * volumeLiters) / (moles * R) });
      }
    }
  }

  private ok(data: Omit<IdealGasLawCalculatorOutput, "error">): ToolResult<IdealGasLawCalculatorOutput> {
    return {
      success: true,
      data: {
        error: null,
        pressureAtm: clean(data.pressureAtm),
        volumeLiters: clean(data.volumeLiters),
        moles: clean(data.moles),
        temperatureKelvin: clean(data.temperatureKelvin),
      },
      metadata: {},
    };
  }

  private errorResult(error: IdealGasLawCalculatorError): ToolResult<IdealGasLawCalculatorOutput> {
    return {
      success: true,
      data: { error, pressureAtm: 0, volumeLiters: 0, moles: 0, temperatureKelvin: 0 },
      metadata: {},
    };
  }
}
