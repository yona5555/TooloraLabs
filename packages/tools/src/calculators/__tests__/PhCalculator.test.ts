import { describe, it, expect } from "vitest";
import { PhCalculator } from "../PhCalculator";

const context = { locale: "en-US" };
const calc = new PhCalculator();
const base = { operation: "fromH" as const, hConcentration: 0, pH: 0, ohConcentration: 0, pOH: 0 };

describe("PhCalculator", () => {
  it("computes pH from hydrogen ion concentration", () => {
    const r = calc.execute({ ...base, operation: "fromH", hConcentration: 1e-3 }, context);
    expect(r.data.pH).toBe(3);
    expect(r.data.pOH).toBe(11);
    expect(r.data.classification).toBe("acidic");
  });

  it("computes hydrogen ion concentration from pH", () => {
    const r = calc.execute({ ...base, operation: "fromPH", pH: 7 }, context);
    expect(r.data.hConcentration).toBeCloseTo(1e-7, 15);
    expect(r.data.classification).toBe("neutral");
  });

  it("computes pH from hydroxide ion concentration", () => {
    const r = calc.execute({ ...base, operation: "fromOH", ohConcentration: 1e-2 }, context);
    expect(r.data.pOH).toBe(2);
    expect(r.data.pH).toBe(12);
    expect(r.data.classification).toBe("basic");
  });

  it("computes pH from pOH", () => {
    const r = calc.execute({ ...base, operation: "fromPOH", pOH: 5 }, context);
    expect(r.data.pH).toBe(9);
    expect(r.data.classification).toBe("basic");
  });

  it("classifies pH 7 as neutral", () => {
    const r = calc.execute({ ...base, operation: "fromPH", pH: 7 }, context);
    expect(r.data.classification).toBe("neutral");
  });

  it("flags non-positive concentration when solving from [H+]", () => {
    const r = calc.execute({ ...base, operation: "fromH", hConcentration: 0 }, context);
    expect(r.data.error).toBe("non-positive-concentration");
  });

  it("flags non-positive concentration when solving from [OH-]", () => {
    const r = calc.execute({ ...base, operation: "fromOH", ohConcentration: -1 }, context);
    expect(r.data.error).toBe("non-positive-concentration");
  });

  it("round-trips a strongly acidic pH", () => {
    const r = calc.execute({ ...base, operation: "fromPH", pH: 1 }, context);
    expect(r.data.hConcentration).toBeCloseTo(0.1, 10);
    expect(r.data.ohConcentration).toBeCloseTo(1e-13, 15);
  });
});
