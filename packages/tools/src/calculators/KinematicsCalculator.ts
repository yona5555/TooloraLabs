import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type KinematicsMode = "timeBased" | "distanceBased";
export type KinematicsSolveForTime = "v" | "v0" | "a" | "t";
export type KinematicsSolveForDistance = "v" | "v0" | "a" | "dx";

export type KinematicsCalculatorInput = {
  mode: KinematicsMode;
  solveForTime: KinematicsSolveForTime;
  solveForDistance: KinematicsSolveForDistance;
  v0: number;
  v: number;
  a: number;
  t: number;
  dx: number;
};

export type KinematicsCalculatorError = "zero-time" | "zero-acceleration" | "zero-displacement" | "negative-discriminant";

export type KinematicsCalculatorOutput = {
  error: KinematicsCalculatorError | null;
  v0: number;
  v: number;
  a: number;
  t: number;
  dx: number;
  dxAvailable: boolean;
  tAvailable: boolean;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

export class KinematicsCalculator extends BaseCalculator<KinematicsCalculatorInput, KinematicsCalculatorOutput> {
  metadata = {
    id: "kinematics-calculator",
    slug: "kinematics-calculator",
    name: "Kinematics Calculator",
    category: "math-science",
    description: "Solve constant-acceleration motion problems for velocity, initial velocity, acceleration, time, or displacement.",
    version: "1.0.0",
  };

  execute(input: KinematicsCalculatorInput, _context: ToolContext): ToolResult<KinematicsCalculatorOutput> {
    if (input.mode === "timeBased") {
      return this.executeTimeBased(input);
    }
    return this.executeDistanceBased(input);
  }

  private executeTimeBased(input: KinematicsCalculatorInput): ToolResult<KinematicsCalculatorOutput> {
    const { solveForTime, v0, v, a, t } = input;

    let resultV0 = v0;
    let resultV = v;
    let resultA = a;
    let resultT = t;

    switch (solveForTime) {
      case "v":
        resultV = v0 + a * t;
        break;
      case "v0":
        resultV0 = v - a * t;
        break;
      case "a":
        if (t === 0) return this.errorResult("zero-time");
        resultA = (v - v0) / t;
        break;
      case "t":
        if (a === 0) return this.errorResult("zero-acceleration");
        resultT = (v - v0) / a;
        break;
    }

    const dx = 0.5 * (resultV0 + resultV) * resultT;

    return this.ok({ v0: resultV0, v: resultV, a: resultA, t: resultT, dx, dxAvailable: true, tAvailable: true });
  }

  private executeDistanceBased(input: KinematicsCalculatorInput): ToolResult<KinematicsCalculatorOutput> {
    const { solveForDistance, v0, v, a, dx } = input;

    let resultV0 = v0;
    let resultV = v;
    let resultA = a;
    let resultDx = dx;

    switch (solveForDistance) {
      case "v": {
        const discriminant = v0 * v0 + 2 * a * dx;
        if (discriminant < 0) return this.errorResult("negative-discriminant");
        resultV = Math.sqrt(discriminant);
        break;
      }
      case "v0": {
        const discriminant = v * v - 2 * a * dx;
        if (discriminant < 0) return this.errorResult("negative-discriminant");
        resultV0 = Math.sqrt(discriminant);
        break;
      }
      case "a": {
        if (dx === 0) return this.errorResult("zero-displacement");
        resultA = (v * v - v0 * v0) / (2 * dx);
        break;
      }
      case "dx": {
        if (a === 0) return this.errorResult("zero-acceleration");
        resultDx = (v * v - v0 * v0) / (2 * a);
        break;
      }
    }

    const tAvailable = resultA !== 0;
    const t = tAvailable ? (resultV - resultV0) / resultA : 0;

    return this.ok({ v0: resultV0, v: resultV, a: resultA, t, dx: resultDx, dxAvailable: true, tAvailable });
  }

  private ok(data: Omit<KinematicsCalculatorOutput, "error">): ToolResult<KinematicsCalculatorOutput> {
    return {
      success: true,
      data: {
        error: null,
        v0: clean(data.v0),
        v: clean(data.v),
        a: clean(data.a),
        t: clean(data.t),
        dx: clean(data.dx),
        dxAvailable: data.dxAvailable,
        tAvailable: data.tAvailable,
      },
      metadata: {},
    };
  }

  private errorResult(error: KinematicsCalculatorError): ToolResult<KinematicsCalculatorOutput> {
    return {
      success: true,
      data: { error, v0: 0, v: 0, a: 0, t: 0, dx: 0, dxAvailable: false, tAvailable: false },
      metadata: {},
    };
  }
}
