import { describe, it, expect } from "vitest";
import { ScientificCalculator } from "../ScientificCalculator";

const tool = new ScientificCalculator();
const ctx = { locale: "en-US" };

describe("ScientificCalculator - basic arithmetic", () => {
  it("adds two numbers", () => {
    const output = tool.execute({ operation: "add", a: 2, b: 3 }, ctx);
    expect(output).toEqual({ success: true, data: { result: 5 }, metadata: {} });
  });

  it("subtracts two numbers", () => {
    const output = tool.execute({ operation: "subtract", a: 5, b: 3 }, ctx);
    expect(output.data.result).toBe(2);
  });

  it("multiplies two numbers", () => {
    const output = tool.execute({ operation: "multiply", a: 4, b: 6 }, ctx);
    expect(output.data.result).toBe(24);
  });

  it("divides two numbers", () => {
    const output = tool.execute({ operation: "divide", a: 10, b: 4 }, ctx);
    expect(output.data.result).toBe(2.5);
  });

  it("returns a DIVISION_BY_ZERO error instead of Infinity", () => {
    const output = tool.execute({ operation: "divide", a: 5, b: 0 }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("DIVISION_BY_ZERO");
    expect(Number.isFinite(output.data.result)).toBe(true);
  });

  it("requires a second operand for binary operations", () => {
    const output = tool.execute({ operation: "add", a: 5 }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("MISSING_OPERAND");
  });
});

describe("ScientificCalculator - powers and roots", () => {
  it("computes x^y", () => {
    const output = tool.execute({ operation: "power", a: 2, b: 10 }, ctx);
    expect(output.data.result).toBe(1024);
  });

  it("computes square and cube", () => {
    expect(tool.execute({ operation: "square", a: 7 }, ctx).data.result).toBe(49);
    expect(tool.execute({ operation: "cube", a: 3 }, ctx).data.result).toBe(27);
  });

  it("computes square root", () => {
    expect(tool.execute({ operation: "sqrt", a: 81 }, ctx).data.result).toBe(9);
  });

  it("returns a DOMAIN_ERROR for square root of a negative number", () => {
    const output = tool.execute({ operation: "sqrt", a: -4 }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("DOMAIN_ERROR");
  });

  it("computes the y-th root, including negative bases with an odd root", () => {
    const output = tool.execute({ operation: "root", a: -8, b: 3 }, ctx);
    expect(output.data.result).toBeCloseTo(-2, 10);
  });

  it("returns a DOMAIN_ERROR for an even root of a negative number", () => {
    const output = tool.execute({ operation: "root", a: -16, b: 2 }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("DOMAIN_ERROR");
  });

  it("computes cube root directly", () => {
    expect(tool.execute({ operation: "cbrt", a: 27 }, ctx).data.result).toBe(3);
  });
});

describe("ScientificCalculator - trigonometry", () => {
  it("computes sin/cos/tan in degree mode", () => {
    expect(
      tool.execute({ operation: "sin", a: 30, angleMode: "deg" }, ctx).data.result
    ).toBeCloseTo(0.5, 10);
    expect(
      tool.execute({ operation: "cos", a: 60, angleMode: "deg" }, ctx).data.result
    ).toBeCloseTo(0.5, 10);
    expect(
      tool.execute({ operation: "tan", a: 45, angleMode: "deg" }, ctx).data.result
    ).toBeCloseTo(1, 10);
  });

  it("computes sin in radian mode", () => {
    const output = tool.execute(
      { operation: "sin", a: Math.PI / 2, angleMode: "rad" },
      ctx
    );
    expect(output.data.result).toBeCloseTo(1, 10);
  });

  it("computes inverse trig functions back to degrees", () => {
    const output = tool.execute({ operation: "asin", a: 0.5, angleMode: "deg" }, ctx);
    expect(output.data.result).toBeCloseTo(30, 8);
  });

  it("returns a DOMAIN_ERROR for asin/acos outside [-1, 1]", () => {
    const asin = tool.execute({ operation: "asin", a: 2 }, ctx);
    const acos = tool.execute({ operation: "acos", a: -1.5 }, ctx);
    expect(asin.success).toBe(false);
    expect(asin.metadata.error).toBe("DOMAIN_ERROR");
    expect(acos.success).toBe(false);
    expect(acos.metadata.error).toBe("DOMAIN_ERROR");
  });

  it("returns an OUT_OF_RANGE error for tan(90 degrees) instead of a huge/Infinity value", () => {
    const output = tool.execute({ operation: "tan", a: 90, angleMode: "deg" }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("OUT_OF_RANGE");
  });
});

describe("ScientificCalculator - logarithms and exponentials", () => {
  it("computes natural log and log base 10", () => {
    expect(tool.execute({ operation: "ln", a: Math.E }, ctx).data.result).toBeCloseTo(1, 10);
    expect(tool.execute({ operation: "log10", a: 1000 }, ctx).data.result).toBeCloseTo(3, 10);
  });

  it("returns a DOMAIN_ERROR for log of zero or a negative number", () => {
    const lnZero = tool.execute({ operation: "ln", a: 0 }, ctx);
    const logNegative = tool.execute({ operation: "log10", a: -5 }, ctx);
    expect(lnZero.success).toBe(false);
    expect(lnZero.metadata.error).toBe("DOMAIN_ERROR");
    expect(logNegative.success).toBe(false);
    expect(logNegative.metadata.error).toBe("DOMAIN_ERROR");
  });

  it("computes e^x and 10^x", () => {
    expect(tool.execute({ operation: "exp", a: 1 }, ctx).data.result).toBeCloseTo(Math.E, 10);
    expect(tool.execute({ operation: "pow10", a: 3 }, ctx).data.result).toBe(1000);
  });

  it("computes the reciprocal and rejects 1/0", () => {
    expect(tool.execute({ operation: "reciprocal", a: 4 }, ctx).data.result).toBe(0.25);
    const output = tool.execute({ operation: "reciprocal", a: 0 }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("DIVISION_BY_ZERO");
  });

  it("computes an arbitrary-base logarithm", () => {
    expect(tool.execute({ operation: "logBase", a: 8, b: 2 }, ctx).data.result).toBeCloseTo(3, 10);
    expect(tool.execute({ operation: "logBase", a: 100, b: 10 }, ctx).data.result).toBeCloseTo(2, 10);
  });

  it("returns a DOMAIN_ERROR for a non-positive argument, non-positive base, or base of 1", () => {
    expect(tool.execute({ operation: "logBase", a: -1, b: 2 }, ctx).success).toBe(false);
    expect(tool.execute({ operation: "logBase", a: 8, b: -2 }, ctx).success).toBe(false);
    expect(tool.execute({ operation: "logBase", a: 8, b: 1 }, ctx).metadata.error).toBe("DOMAIN_ERROR");
  });
});

describe("ScientificCalculator - reciprocal trig (cot/sec/csc)", () => {
  it("computes cot/sec/csc in degree mode", () => {
    expect(tool.execute({ operation: "cot", a: 45, angleMode: "deg" }, ctx).data.result).toBeCloseTo(1, 10);
    expect(tool.execute({ operation: "sec", a: 60, angleMode: "deg" }, ctx).data.result).toBeCloseTo(2, 10);
    expect(tool.execute({ operation: "csc", a: 30, angleMode: "deg" }, ctx).data.result).toBeCloseTo(2, 10);
  });

  it("returns a clean 0 for cot(90°), not an error (cos(90°)/sin(90°) = 0/1)", () => {
    expect(tool.execute({ operation: "cot", a: 90, angleMode: "deg" }, ctx).data.result).toBeCloseTo(0, 10);
  });

  it("returns DIVISION_BY_ZERO where the underlying cos/sin is exactly zero", () => {
    expect(tool.execute({ operation: "cot", a: 0, angleMode: "deg" }, ctx).metadata.error).toBe("DIVISION_BY_ZERO");
    expect(tool.execute({ operation: "sec", a: 90, angleMode: "deg" }, ctx).metadata.error).toBe("DIVISION_BY_ZERO");
    expect(tool.execute({ operation: "csc", a: 0, angleMode: "deg" }, ctx).metadata.error).toBe("DIVISION_BY_ZERO");
  });

  it("returns DIVISION_BY_ZERO at 180°, where cos/sin is only a floating-point-imprecise near-zero, not exactly 0", () => {
    // Math.PI is never exact, so Math.sin(Math.PI) is ~1.2e-16, not 0 — this
    // is exactly the bug class that slipped through an earlier version of
    // this file (checked the input for exact zero instead of the output for
    // a blown-up magnitude).
    expect(tool.execute({ operation: "cot", a: 180, angleMode: "deg" }, ctx).metadata.error).toBe("DIVISION_BY_ZERO");
  });
});

describe("ScientificCalculator - factorial, absolute value, 2^x, percent", () => {
  it("computes factorial of a non-negative integer", () => {
    expect(tool.execute({ operation: "factorial", a: 0 }, ctx).data.result).toBe(1);
    expect(tool.execute({ operation: "factorial", a: 5 }, ctx).data.result).toBe(120);
  });

  it("returns a DOMAIN_ERROR for a negative or non-integer input", () => {
    expect(tool.execute({ operation: "factorial", a: -1 }, ctx).metadata.error).toBe("DOMAIN_ERROR");
    expect(tool.execute({ operation: "factorial", a: 2.5 }, ctx).metadata.error).toBe("DOMAIN_ERROR");
  });

  it("returns an OUT_OF_RANGE error beyond 170!", () => {
    expect(tool.execute({ operation: "factorial", a: 171 }, ctx).metadata.error).toBe("OUT_OF_RANGE");
  });

  it("computes absolute value", () => {
    expect(tool.execute({ operation: "abs", a: -7.5 }, ctx).data.result).toBe(7.5);
    expect(tool.execute({ operation: "abs", a: 7.5 }, ctx).data.result).toBe(7.5);
  });

  it("computes 2^x", () => {
    expect(tool.execute({ operation: "twoPow", a: 10 }, ctx).data.result).toBe(1024);
  });

  it("computes percent as a fraction of 100", () => {
    expect(tool.execute({ operation: "percent", a: 25 }, ctx).data.result).toBe(0.25);
  });
});

describe("ScientificCalculator - combinations and permutations", () => {
  it("computes nCr", () => {
    expect(tool.execute({ operation: "nCr", a: 5, b: 3 }, ctx).data.result).toBe(10);
    expect(tool.execute({ operation: "nCr", a: 10, b: 0 }, ctx).data.result).toBe(1);
    expect(tool.execute({ operation: "nCr", a: 10, b: 10 }, ctx).data.result).toBe(1);
    expect(tool.execute({ operation: "nCr", a: 52, b: 5 }, ctx).data.result).toBe(2598960);
  });

  it("computes nPr", () => {
    expect(tool.execute({ operation: "nPr", a: 5, b: 3 }, ctx).data.result).toBe(60);
    expect(tool.execute({ operation: "nPr", a: 10, b: 0 }, ctx).data.result).toBe(1);
  });

  it("returns a DOMAIN_ERROR when r > n, or for negative/non-integer inputs", () => {
    expect(tool.execute({ operation: "nCr", a: 3, b: 5 }, ctx).metadata.error).toBe("DOMAIN_ERROR");
    expect(tool.execute({ operation: "nPr", a: 3, b: 5 }, ctx).metadata.error).toBe("DOMAIN_ERROR");
    expect(tool.execute({ operation: "nCr", a: -1, b: 2 }, ctx).metadata.error).toBe("DOMAIN_ERROR");
    expect(tool.execute({ operation: "nCr", a: 5, b: 2.5 }, ctx).metadata.error).toBe("DOMAIN_ERROR");
  });

  it("stays numerically exact for a large nCr that a full-factorial approach would overflow on", () => {
    // 200! overflows to Infinity, but C(200, 3) itself is a small, exact integer.
    expect(tool.execute({ operation: "nCr", a: 200, b: 3 }, ctx).data.result).toBe(1313400);
  });
});

describe("ScientificCalculator - numerical calculus", () => {
  it("numerically differentiates sin (in degree mode) close to cos(x) * pi/180", () => {
    const result = tool.execute({ operation: "numDerivativeSin", a: 60, angleMode: "deg" }, ctx).data.result;
    const expected = Math.cos((60 * Math.PI) / 180) * (Math.PI / 180);
    expect(result).toBeCloseTo(expected, 6);
  });

  it("numerically differentiates sin (in radian mode) close to cos(x)", () => {
    const result = tool.execute({ operation: "numDerivativeSin", a: Math.PI / 3, angleMode: "rad" }, ctx).data.result;
    expect(result).toBeCloseTo(Math.cos(Math.PI / 3), 6);
  });

  it("numerically differentiates x^2 close to 2x", () => {
    expect(tool.execute({ operation: "numDerivativeSquare", a: 4 }, ctx).data.result).toBeCloseTo(8, 4);
    expect(tool.execute({ operation: "numDerivativeSquare", a: 0 }, ctx).data.result).toBeCloseTo(0, 4);
  });

  it("numerically integrates x^2 over [0, a] close to a^3/3", () => {
    expect(tool.execute({ operation: "numIntegralSquare", a: 3 }, ctx).data.result).toBeCloseTo(9, 6);
    expect(tool.execute({ operation: "numIntegralSquare", a: 0 }, ctx).data.result).toBe(0);
  });

  it("returns a DOMAIN_ERROR for a negative integration bound", () => {
    expect(tool.execute({ operation: "numIntegralSquare", a: -1 }, ctx).metadata.error).toBe("DOMAIN_ERROR");
  });
});
