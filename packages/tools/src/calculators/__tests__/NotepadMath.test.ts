import { describe, expect, it } from "vitest";
import {
  analyzeNotepad,
  dependencyTree,
  evaluationSteps,
  inputImpacts,
  magnitude,
  rewriteAssignment,
  roundingViews,
  scopeBefore,
  substituteExpression,
  sweepVariable,
} from "../NotepadMath";

const TRIP = "Trip\nflights = 2 * 340\nhotel = 4 * 125\nfood = 4 * 60\ntotal = flights + hotel + food\nSplit:\nshare = total / 2\nmonths = 5\nmonthly = share / months";

describe("NotepadMath", () => {
  const a = analyzeNotepad(TRIP);

  it("classifies lines and finds the bottom line", () => {
    expect(a.counts).toMatchObject({ note: 2, assign: 7, expr: 0, blank: 0, calculated: 7, nonBlank: 9 });
    expect(a.finalIndex).toBe(8);
    expect(a.finalValue).toBe(142);
    expect(a.coverage).toBeCloseTo((7 / 9) * 100);
  });

  it("tracks dependencies to the defining line", () => {
    expect(a.lines[4].deps.map((d) => d.line)).toEqual([1, 2, 3]);
    const inputs = a.variables.filter((v) => v.isInput).map((v) => v.name);
    expect(inputs).toEqual(["flights", "hotel", "food", "months"]);
    expect(a.variables.find((v) => v.name === "total")?.usedBy).toBe(1);
  });

  it("counts operator families", () => {
    expect(a.opTotals).toMatchObject({ add: 2, mul: 5, pow: 0, fn: 0 });
  });

  it("re-evaluates with an override (what-if)", () => {
    const sweep = sweepVariable(TRIP, a.finalIndex, "months", [2, 10]);
    expect(sweep[0].y).toBe(355);
    expect(sweep[1].y).toBe(71);
  });

  it("ranks input impacts", () => {
    const imp = inputImpacts(a, TRIP, 10);
    expect(imp[0].name).toBe("months");
    expect(imp[0].delta).toBeCloseTo(142 / 1.1 - 142);
    expect(imp.find((i) => i.name === "flights")?.delta).toBeCloseTo(6.8);
  });

  it("builds a finite dependency tree, even with reassignment", () => {
    const t = dependencyTree(a, a.finalIndex)!;
    expect(t.children.map((c) => c.name)).toEqual(["share", "months"]);
    const r = analyzeNotepad("x = 2\nx = x * 3\nx + 1");
    expect(r.lines[1].reassign).toBe(true);
    expect(dependencyTree(r, 2)!.children[0].children[0].value).toBe(2);
    expect(r.variables[0].isInput).toBe(false);
  });

  it("lists evaluation steps in precedence order", () => {
    const steps = evaluationSteps("3 + 4 * 2 ^ 2", {});
    expect(steps.map((s) => s.text)).toEqual(["2 ^ 2 = 4", "4 × 4 = 16", "3 + 16 = 19"]);
    const v = evaluationSteps("sqrt(x) - 1", { x: 16 });
    expect(v.map((s) => s.kind)).toEqual(["var", "fn", "op"]);
  });

  it("substitutes values and builds scope", () => {
    const scope = scopeBefore(a, 4);
    expect(substituteExpression("flights + hotel + food", scope)).toBe("680 + 500 + 240");
  });

  it("reports rounding and magnitude", () => {
    const r = roundingViews(0.1 + 0.2);
    expect(r.raw).toBe("0.30000000000000004");
    expect(r.shown).toBe("0.3");
    expect(r.hiddenError).toBeGreaterThan(0);
    expect(r.hiddenError).toBeLessThan(1e-16);
    expect(magnitude(1420)).toBe(3);
    expect(magnitude(0.05)).toBe(-2);
  });

  it("rewrites an assignment value", () => {
    expect(rewriteAssignment("a = 1\n  b = a + 2", 1, 7.5)).toBe("a = 1\n  b = 7.5");
    expect(rewriteAssignment("note", 0, 3)).toBe("note");
  });
});
