import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type ScientificOperation =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "power"
  | "root"
  | "logBase"
  | "sin"
  | "cos"
  | "tan"
  | "cot"
  | "sec"
  | "csc"
  | "asin"
  | "acos"
  | "atan"
  | "sqrt"
  | "cbrt"
  | "square"
  | "cube"
  | "ln"
  | "log10"
  | "exp"
  | "pow10"
  | "twoPow"
  | "reciprocal"
  | "factorial"
  | "abs"
  | "percent";

export type AngleMode = "deg" | "rad";

export type ScientificCalculatorInput = {
  operation: ScientificOperation;
  a: number;
  b?: number;
  angleMode?: AngleMode;
};

export type ScientificCalculatorOutput = {
  result: number;
};

export type ScientificCalculatorErrorCode =
  | "DIVISION_BY_ZERO"
  | "DOMAIN_ERROR"
  | "OUT_OF_RANGE"
  | "MISSING_OPERAND";

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function finiteOrError(
  value: number
): { value: number } | { error: ScientificCalculatorErrorCode } {
  return Number.isFinite(value) ? { value } : { error: "OUT_OF_RANGE" };
}

// tan() is undefined at odd multiples of 90 degrees, but floating-point
// imprecision means Math.PI / 2 is never exact, so Math.tan() returns a
// huge finite number there instead of Infinity. Treat anything beyond a
// sane magnitude as the undefined case a calculator user would expect.
const TAN_MAGNITUDE_LIMIT = 1e10;

function tanOrError(
  value: number
): { value: number } | { error: ScientificCalculatorErrorCode } {
  if (!Number.isFinite(value) || Math.abs(value) > TAN_MAGNITUDE_LIMIT) {
    return { error: "OUT_OF_RANGE" };
  }
  return { value };
}

const BINARY_OPERATIONS = new Set<ScientificOperation>([
  "add",
  "subtract",
  "multiply",
  "divide",
  "power",
  "root",
  "logBase",
]);

// sec/csc are 1/cos and 1/sin. At the angles where they're undefined (90°,
// 0°, ...), cos/sin aren't exactly 0 in floating point (Math.PI/2 etc. are
// never exact) — they're a tiny near-zero value, so the *reciprocal* is what
// blows up to a huge finite number, not the input. Checking the computed
// reciprocal's own magnitude (the same approach tan() already uses for
// itself) catches this; checking the input would miss it entirely, since a
// value like 6e-17 is neither exactly 0 nor huge.
function reciprocalTrigOrError(
  value: number
): { value: number } | { error: ScientificCalculatorErrorCode } {
  if (!Number.isFinite(value)) {
    return { error: "OUT_OF_RANGE" };
  }
  if (value === 0) {
    return { error: "DIVISION_BY_ZERO" };
  }
  const reciprocal = 1 / value;
  if (Math.abs(reciprocal) > TAN_MAGNITUDE_LIMIT) {
    return { error: "DIVISION_BY_ZERO" };
  }
  return { value: reciprocal };
}

const FACTORIAL_MAX = 170; // 171! overflows to Infinity in IEEE-754 double precision.

function factorialOrError(
  a: number
): { value: number } | { error: ScientificCalculatorErrorCode } {
  if (!Number.isInteger(a) || a < 0) {
    return { error: "DOMAIN_ERROR" };
  }
  if (a > FACTORIAL_MAX) {
    return { error: "OUT_OF_RANGE" };
  }
  let result = 1;
  for (let i = 2; i <= a; i++) result *= i;
  return { value: result };
}

export class ScientificCalculator extends BaseCalculator<
  ScientificCalculatorInput,
  ScientificCalculatorOutput
> {
  metadata = {
    id: "scientific-calculator",
    slug: "scientific-calculator",
    name: "Scientific Calculator",
    category: "calculators",
    description: "A full scientific calculator with trigonometric, logarithmic, and power functions.",
    version: "1.0.0",
  };

  execute(
    input: ScientificCalculatorInput,
    _context: ToolContext
  ): ToolResult<ScientificCalculatorOutput> {
    const { operation, a } = input;
    const angleMode: AngleMode = input.angleMode ?? "deg";

    if (BINARY_OPERATIONS.has(operation) && input.b === undefined) {
      return this.fail("MISSING_OPERAND");
    }
    const b = input.b ?? 0;

    let outcome: { value: number } | { error: ScientificCalculatorErrorCode };

    switch (operation) {
      case "add":
        outcome = { value: a + b };
        break;
      case "subtract":
        outcome = { value: a - b };
        break;
      case "multiply":
        outcome = { value: a * b };
        break;
      case "divide":
        outcome = b === 0 ? { error: "DIVISION_BY_ZERO" } : { value: a / b };
        break;
      case "power":
        outcome = finiteOrError(Math.pow(a, b));
        break;
      case "root":
        if (b === 0) {
          outcome = { error: "DIVISION_BY_ZERO" };
        } else if (a < 0 && b % 2 === 0) {
          outcome = { error: "DOMAIN_ERROR" };
        } else {
          const value = a < 0 ? -Math.pow(-a, 1 / b) : Math.pow(a, 1 / b);
          outcome = finiteOrError(value);
        }
        break;
      case "sin":
        outcome = { value: Math.sin(angleMode === "deg" ? toRadians(a) : a) };
        break;
      case "cos":
        outcome = { value: Math.cos(angleMode === "deg" ? toRadians(a) : a) };
        break;
      case "tan":
        outcome = tanOrError(Math.tan(angleMode === "deg" ? toRadians(a) : a));
        break;
      case "cot": {
        // Derived as cos/sin directly rather than 1/tan: at 90°, tan()
        // itself blows up to a huge (not infinite) finite value due to
        // floating-point imprecision, which would falsely flag a perfectly
        // clean result (cot(90°) = 0/1 = 0) as out of range. The result's
        // own magnitude is checked (not just an exact-zero sin check) for
        // the same reason sec/csc check their reciprocal's magnitude: at
        // 180°, sin() is a tiny non-zero value, not exactly 0, so only the
        // *computed* cot blows up large enough to catch.
        const radians = angleMode === "deg" ? toRadians(a) : a;
        const sinValue = Math.sin(radians);
        if (sinValue === 0) {
          outcome = { error: "DIVISION_BY_ZERO" };
        } else {
          const result = Math.cos(radians) / sinValue;
          outcome = Math.abs(result) > TAN_MAGNITUDE_LIMIT ? { error: "DIVISION_BY_ZERO" } : finiteOrError(result);
        }
        break;
      }
      case "sec":
        outcome = reciprocalTrigOrError(Math.cos(angleMode === "deg" ? toRadians(a) : a));
        break;
      case "csc":
        outcome = reciprocalTrigOrError(Math.sin(angleMode === "deg" ? toRadians(a) : a));
        break;
      case "asin":
        if (a < -1 || a > 1) {
          outcome = { error: "DOMAIN_ERROR" };
        } else {
          const radians = Math.asin(a);
          outcome = { value: angleMode === "deg" ? toDegrees(radians) : radians };
        }
        break;
      case "acos":
        if (a < -1 || a > 1) {
          outcome = { error: "DOMAIN_ERROR" };
        } else {
          const radians = Math.acos(a);
          outcome = { value: angleMode === "deg" ? toDegrees(radians) : radians };
        }
        break;
      case "atan": {
        const radians = Math.atan(a);
        outcome = { value: angleMode === "deg" ? toDegrees(radians) : radians };
        break;
      }
      case "sqrt":
        outcome = a < 0 ? { error: "DOMAIN_ERROR" } : { value: Math.sqrt(a) };
        break;
      case "cbrt":
        outcome = { value: Math.cbrt(a) };
        break;
      case "square":
        outcome = finiteOrError(a * a);
        break;
      case "cube":
        outcome = finiteOrError(a * a * a);
        break;
      case "ln":
        outcome = a <= 0 ? { error: "DOMAIN_ERROR" } : { value: Math.log(a) };
        break;
      case "log10":
        outcome = a <= 0 ? { error: "DOMAIN_ERROR" } : { value: Math.log10(a) };
        break;
      case "exp":
        outcome = finiteOrError(Math.exp(a));
        break;
      case "pow10":
        outcome = finiteOrError(Math.pow(10, a));
        break;
      case "reciprocal":
        outcome = a === 0 ? { error: "DIVISION_BY_ZERO" } : { value: 1 / a };
        break;
      case "twoPow":
        outcome = finiteOrError(Math.pow(2, a));
        break;
      case "factorial":
        outcome = factorialOrError(a);
        break;
      case "abs":
        outcome = { value: Math.abs(a) };
        break;
      case "percent":
        outcome = { value: a / 100 };
        break;
      case "logBase":
        if (a <= 0 || b <= 0 || b === 1) {
          outcome = { error: "DOMAIN_ERROR" };
        } else {
          outcome = finiteOrError(Math.log(a) / Math.log(b));
        }
        break;
    }

    if ("error" in outcome) {
      return this.fail(outcome.error);
    }
    return { success: true, data: { result: outcome.value }, metadata: {} };
  }

  private fail(
    error: ScientificCalculatorErrorCode
  ): ToolResult<ScientificCalculatorOutput> {
    return { success: false, data: { result: 0 }, metadata: { error } };
  }
}
