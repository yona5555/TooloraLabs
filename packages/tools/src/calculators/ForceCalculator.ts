import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type ForceMode = "secondLaw" | "gravitation";
export type SecondLawSolveFor = "force" | "mass" | "acceleration";
export type GravitationSolveFor = "force" | "mass1" | "mass2" | "distance";

export type ForceCalculatorInput = {
  mode: ForceMode;
  secondLawSolveFor: SecondLawSolveFor;
  gravitationSolveFor: GravitationSolveFor;
  force: number;
  mass: number;
  acceleration: number;
  mass1: number;
  mass2: number;
  distance: number;
};

export type ForceCalculatorError = "zero-acceleration" | "zero-mass" | "zero-mass1" | "zero-mass2" | "zero-distance" | "zero-force";

export type ForceCalculatorOutput = {
  error: ForceCalculatorError | null;
  force: number;
  mass: number;
  acceleration: number;
  mass1: number;
  mass2: number;
  distance: number;
};

const G = 6.674e-11;

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

export class ForceCalculator extends BaseCalculator<ForceCalculatorInput, ForceCalculatorOutput> {
  metadata = {
    id: "force-calculator",
    slug: "force-calculator",
    name: "Force & Newton's Law Calculator",
    category: "math-science",
    description: "Solve Newton's second law (F = ma) or the law of universal gravitation for force, mass, acceleration, or distance.",
    version: "1.0.0",
  };

  execute(input: ForceCalculatorInput, _context: ToolContext): ToolResult<ForceCalculatorOutput> {
    if (input.mode === "secondLaw") {
      return this.executeSecondLaw(input);
    }
    return this.executeGravitation(input);
  }

  private executeSecondLaw(input: ForceCalculatorInput): ToolResult<ForceCalculatorOutput> {
    const { secondLawSolveFor, force, mass, acceleration } = input;

    let resultForce = force;
    let resultMass = mass;
    let resultAcceleration = acceleration;

    switch (secondLawSolveFor) {
      case "force":
        resultForce = mass * acceleration;
        break;
      case "mass":
        if (acceleration === 0) return this.errorResult("zero-acceleration");
        resultMass = force / acceleration;
        break;
      case "acceleration":
        if (mass === 0) return this.errorResult("zero-mass");
        resultAcceleration = force / mass;
        break;
    }

    return this.ok({ force: resultForce, mass: resultMass, acceleration: resultAcceleration, mass1: 0, mass2: 0, distance: 0 });
  }

  private executeGravitation(input: ForceCalculatorInput): ToolResult<ForceCalculatorOutput> {
    const { gravitationSolveFor, force, mass1, mass2, distance } = input;

    let resultForce = force;
    let resultMass1 = mass1;
    let resultMass2 = mass2;
    let resultDistance = distance;

    switch (gravitationSolveFor) {
      case "force": {
        if (distance === 0) return this.errorResult("zero-distance");
        resultForce = (G * mass1 * mass2) / (distance * distance);
        break;
      }
      case "mass1": {
        if (mass2 === 0) return this.errorResult("zero-mass2");
        resultMass1 = (force * distance * distance) / (G * mass2);
        break;
      }
      case "mass2": {
        if (mass1 === 0) return this.errorResult("zero-mass1");
        resultMass2 = (force * distance * distance) / (G * mass1);
        break;
      }
      case "distance": {
        if (force === 0) return this.errorResult("zero-force");
        resultDistance = Math.sqrt((G * mass1 * mass2) / force);
        break;
      }
    }

    return this.ok({ force: resultForce, mass: 0, acceleration: 0, mass1: resultMass1, mass2: resultMass2, distance: resultDistance });
  }

  private ok(data: Omit<ForceCalculatorOutput, "error">): ToolResult<ForceCalculatorOutput> {
    return {
      success: true,
      data: {
        error: null,
        force: clean(data.force),
        mass: clean(data.mass),
        acceleration: clean(data.acceleration),
        mass1: clean(data.mass1),
        mass2: clean(data.mass2),
        distance: clean(data.distance),
      },
      metadata: {},
    };
  }

  private errorResult(error: ForceCalculatorError): ToolResult<ForceCalculatorOutput> {
    return {
      success: true,
      data: { error, force: 0, mass: 0, acceleration: 0, mass1: 0, mass2: 0, distance: 0 },
      metadata: {},
    };
  }
}
