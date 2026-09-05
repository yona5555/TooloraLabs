import { describe, it, expect } from "vitest";
import { GcfLcmCalculator } from "../GcfLcmCalculator";

const context = { locale: "en-US" };
const calc = new GcfLcmCalculator();

describe("GcfLcmCalculator", () => {
  it("computes the GCF and LCM of two numbers", () => {
    const r = calc.execute({ numbers: [12, 18] }, context);
    expect(r.data.gcf).toBe(6);
    expect(r.data.lcm).toBe(36);
  });

  it("computes the GCF and LCM of three or more numbers pairwise", () => {
    const r = calc.execute({ numbers: [12, 18, 24] }, context);
    expect(r.data.gcf).toBe(6);
    expect(r.data.lcm).toBe(72);
  });

  it("returns the smaller number as GCF when one divides the other", () => {
    const r = calc.execute({ numbers: [8, 32] }, context);
    expect(r.data.gcf).toBe(8);
    expect(r.data.lcm).toBe(32);
  });

  it("returns 1 as GCF for coprime numbers", () => {
    const r = calc.execute({ numbers: [7, 13] }, context);
    expect(r.data.gcf).toBe(1);
    expect(r.data.lcm).toBe(91);
  });

  it("produces correct prime factorizations", () => {
    const r = calc.execute({ numbers: [12, 18] }, context);
    expect(r.data.factorizations[0]).toEqual([
      { prime: 2, exponent: 2 },
      { prime: 3, exponent: 1 },
    ]);
    expect(r.data.factorizations[1]).toEqual([
      { prime: 2, exponent: 1 },
      { prime: 3, exponent: 2 },
    ]);
  });

  it("factorizes a prime number as itself", () => {
    const r = calc.execute({ numbers: [17, 4] }, context);
    expect(r.data.factorizations[0]).toEqual([{ prime: 17, exponent: 1 }]);
  });

  it("flags fewer than two numbers as an error", () => {
    const r = calc.execute({ numbers: [12] }, context);
    expect(r.data.error).toBe("too-few-numbers");
  });

  it("flags a non-positive-integer input as an error", () => {
    expect(calc.execute({ numbers: [12, 0] }, context).data.error).toBe("invalid-number");
    expect(calc.execute({ numbers: [12, -4] }, context).data.error).toBe("invalid-number");
    expect(calc.execute({ numbers: [12, 4.5] }, context).data.error).toBe("invalid-number");
  });
});
