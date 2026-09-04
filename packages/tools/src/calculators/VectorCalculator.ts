import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type VectorCalculatorInput = {
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
};

export type VectorCalculatorError = "zero-vector-a" | "zero-vector-b";

export type VectorCalculatorOutput = {
  error: VectorCalculatorError | null;
  magnitudeA: number;
  magnitudeB: number;
  sumX: number;
  sumY: number;
  sumZ: number;
  differenceX: number;
  differenceY: number;
  differenceZ: number;
  dotProduct: number;
  crossX: number;
  crossY: number;
  crossZ: number;
  angleBetweenDegrees: number | null;
  unitAX: number | null;
  unitAY: number | null;
  unitAZ: number | null;
  /** Scalar projection of A onto B — the signed length of A's shadow along B's direction. Null when B is a zero vector, since B has no direction to project onto. */
  projectionScalar: number | null;
  /** Vector projection of A onto B — the component of A that points along B. Null when B is a zero vector. */
  projectionX: number | null;
  projectionY: number | null;
  projectionZ: number | null;
};

function clean(value: number): number {
  return Number(value.toPrecision(10));
}

/**
 * Computes the standard set of operations on two 3D vectors A and B (2D
 * vectors are just the z = 0 case). All operations that don't depend on
 * either vector's length (sum, difference, dot product, cross product) are
 * always returned; the angle between the vectors and A's unit vector are
 * null when the relevant vector has zero magnitude, since both are
 * undefined in that case.
 */
export class VectorCalculator extends BaseCalculator<VectorCalculatorInput, VectorCalculatorOutput> {
  metadata = {
    id: "vector-calculator",
    slug: "vector-calculator",
    name: "Vector Calculator",
    category: "math-science",
    description: "Compute the magnitude, sum, difference, dot product, cross product, and angle between two 2D or 3D vectors.",
    version: "1.0.0",
  };

  execute(input: VectorCalculatorInput, _context: ToolContext): ToolResult<VectorCalculatorOutput> {
    const { ax, ay, az, bx, by, bz } = input;

    const magnitudeA = Math.sqrt(ax * ax + ay * ay + az * az);
    const magnitudeB = Math.sqrt(bx * bx + by * by + bz * bz);

    const sumX = ax + bx;
    const sumY = ay + by;
    const sumZ = az + bz;

    const differenceX = ax - bx;
    const differenceY = ay - by;
    const differenceZ = az - bz;

    const dotProduct = ax * bx + ay * by + az * bz;

    const crossX = ay * bz - az * by;
    const crossY = az * bx - ax * bz;
    const crossZ = ax * by - ay * bx;

    let error: VectorCalculatorError | null = null;
    let angleBetweenDegrees: number | null = null;
    let unitAX: number | null = null;
    let unitAY: number | null = null;
    let unitAZ: number | null = null;
    let projectionScalar: number | null = null;
    let projectionX: number | null = null;
    let projectionY: number | null = null;
    let projectionZ: number | null = null;

    if (magnitudeA === 0) {
      error = "zero-vector-a";
    } else {
      unitAX = ax / magnitudeA;
      unitAY = ay / magnitudeA;
      unitAZ = az / magnitudeA;
    }

    if (magnitudeB === 0) {
      error = error ?? "zero-vector-b";
    } else {
      projectionScalar = dotProduct / magnitudeB;
      const factor = dotProduct / (magnitudeB * magnitudeB);
      projectionX = factor * bx;
      projectionY = factor * by;
      projectionZ = factor * bz;
    }

    if (magnitudeA > 0 && magnitudeB > 0) {
      const cosTheta = Math.min(1, Math.max(-1, dotProduct / (magnitudeA * magnitudeB)));
      angleBetweenDegrees = (Math.acos(cosTheta) * 180) / Math.PI;
    }

    return this.ok({
      error,
      magnitudeA,
      magnitudeB,
      sumX,
      sumY,
      sumZ,
      differenceX,
      differenceY,
      differenceZ,
      dotProduct,
      crossX,
      crossY,
      crossZ,
      angleBetweenDegrees,
      unitAX,
      unitAY,
      unitAZ,
      projectionScalar,
      projectionX,
      projectionY,
      projectionZ,
    });
  }

  private ok(data: VectorCalculatorOutput): ToolResult<VectorCalculatorOutput> {
    return {
      success: true,
      data: {
        error: data.error,
        magnitudeA: clean(data.magnitudeA),
        magnitudeB: clean(data.magnitudeB),
        sumX: clean(data.sumX),
        sumY: clean(data.sumY),
        sumZ: clean(data.sumZ),
        differenceX: clean(data.differenceX),
        differenceY: clean(data.differenceY),
        differenceZ: clean(data.differenceZ),
        dotProduct: clean(data.dotProduct),
        crossX: clean(data.crossX),
        crossY: clean(data.crossY),
        crossZ: clean(data.crossZ),
        angleBetweenDegrees: data.angleBetweenDegrees === null ? null : clean(data.angleBetweenDegrees),
        unitAX: data.unitAX === null ? null : clean(data.unitAX),
        unitAY: data.unitAY === null ? null : clean(data.unitAY),
        unitAZ: data.unitAZ === null ? null : clean(data.unitAZ),
        projectionScalar: data.projectionScalar === null ? null : clean(data.projectionScalar),
        projectionX: data.projectionX === null ? null : clean(data.projectionX),
        projectionY: data.projectionY === null ? null : clean(data.projectionY),
        projectionZ: data.projectionZ === null ? null : clean(data.projectionZ),
      },
      metadata: {},
    };
  }
}
