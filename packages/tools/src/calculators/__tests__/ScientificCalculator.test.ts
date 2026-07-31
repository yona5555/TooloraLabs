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
});
