import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type EnergyWorkPowerMode = "work" | "kineticEnergy" | "potentialEnergy" | "power";

export type EnergyWorkPowerCalculatorInput = {
  mode: EnergyWorkPowerMode;
  force: number;
  distance: number;
  angleDegrees: number;
  mass: number;
  velocity: number;
  height: number;
  workValue: number;
  time: number;
};

export type EnergyWorkPowerCalculatorError = "zero-time";

export type EnergyWorkPowerCalculatorOutput = {
  error: EnergyWorkPowerCalculatorError | null;
  work: number;
  kineticEnergy: number;
  potentialEnergy: number;
  power: number;
};

const GRAVITY = 9.8;

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

export class EnergyWorkPowerCalculator extends BaseCalculator<EnergyWorkPowerCalculatorInput, EnergyWorkPowerCalculatorOutput> {
  metadata = {
    id: "energy-work-power-calculator",
    slug: "energy-work-power-calculator",
    name: "Energy, Work & Power Calculator",
    category: "math-science",
    description: "Calculate mechanical work, kinetic energy, gravitational potential energy, or power.",
    version: "1.0.0",
  };

  execute(input: EnergyWorkPowerCalculatorInput, _context: ToolContext): ToolResult<EnergyWorkPowerCalculatorOutput> {
    const { mode, force, distance, angleDegrees, mass, velocity, height, workValue, time } = input;

    const empty = { work: 0, kineticEnergy: 0, potentialEnergy: 0, power: 0 };

    switch (mode) {
      case "work": {
        const angleRadians = (angleDegrees * Math.PI) / 180;
        return this.ok({ ...empty, work: force * distance * Math.cos(angleRadians) });
      }
      case "kineticEnergy": {
        return this.ok({ ...empty, kineticEnergy: 0.5 * mass * velocity * velocity });
      }
      case "potentialEnergy": {
        return this.ok({ ...empty, potentialEnergy: mass * GRAVITY * height });
      }
      case "power": {
        if (time <= 0) return this.errorResult("zero-time");
        return this.ok({ ...empty, power: workValue / time });
      }
    }
  }

  private ok(data: Omit<EnergyWorkPowerCalculatorOutput, "error">): ToolResult<EnergyWorkPowerCalculatorOutput> {
    return {
      success: true,
      data: {
        error: null,
        work: clean(data.work),
        kineticEnergy: clean(data.kineticEnergy),
        potentialEnergy: clean(data.potentialEnergy),
        power: clean(data.power),
      },
      metadata: {},
    };
  }

  private errorResult(error: EnergyWorkPowerCalculatorError): ToolResult<EnergyWorkPowerCalculatorOutput> {
    return {
      success: true,
      data: { error, work: 0, kineticEnergy: 0, potentialEnergy: 0, power: 0 },
      metadata: {},
    };
  }
}
