import { describe, expect, it } from "vitest";
import {
  axisTicks,
  compileGraphExpression,
  derivativeFunction,
  findIntersections,
  findKeyPoints,
  niceStep,
  normalizeGraphExpression,
  sampleCurve,
  sampleSurface,
  traceAt,
  valueTable,
  type CompiledGraph,
} from "../FunctionGrapher";

function graph(expr: string): CompiledGraph {
  const g = compileGraphExpression(expr);
  if (!g.ok) throw new Error(`failed: ${expr} (${g.error})`);
  return g;
}

describe("normalizeGraphExpression", () => {
  it("inserts implicit multiplication and maps unicode operators", () => {
    const n = normalizeGraphExpression("y = x^3−3x");
    expect("source" in n && n.source).toBe("x^3-3*x");
    const s = normalizeGraphExpression("z = sin(x)·cos(y)");
    expect("source" in s && s.source).toBe("sin(x)*cos(y)");
    const m = normalizeGraphExpression("2xsin(x)");
    expect("source" in m && m.source).toBe("2*x*sin(x)");
  });
  it("reports unknown symbols and empty input", () => {
    expect(normalizeGraphExpression("  ")).toEqual({ error: "empty" });
    expect(normalizeGraphExpression("x + q")).toEqual({ error: "unknown-symbol", symbol: "q" });
    expect(normalizeGraphExpression("x $ 2")).toEqual({ error: "unknown-symbol", symbol: "$" });
  });
});

describe("compileGraphExpression", () => {
  it("classifies curves and surfaces", () => {
    expect(graph("x^2").kind).toBe("curve");
    const s = graph("z = x^2 - y^2");
    expect(s.kind).toBe("surface");
    expect(s.evaluate(3, 2)).toBe(5);
    expect(s.curve(3)).toBe(9);
  });
  it("evaluates e, pi and exp correctly", () => {
    expect(graph("e^x").curve(1)).toBeCloseTo(Math.E, 12);
    expect(graph("sin(pi x/2)").curve(1)).toBeCloseTo(1, 12);
    expect(graph("exp(x)").curve(0)).toBe(1);
  });
  it("returns clear error codes", () => {
    expect(compileGraphExpression("2 +* x")).toEqual({ ok: false, error: "syntax" });
    expect(compileGraphExpression("sin(x")).toEqual({ ok: false, error: "syntax" });
    expect(compileGraphExpression("sqrt(-1-x^2)")).toEqual({ ok: false, error: "undefined" });
  });
  it("gives null where undefined", () => {
    expect(graph("sqrt(x)").curve(-1)).toBeNull();
    expect(graph("1/x").curve(0)).toBeNull();
  });
});

describe("sampleCurve", () => {
  it("draws one segment for a continuous curve", () => {
    const segs = sampleCurve(graph("x^2").curve, -5, 5, -1, 25, 100);
    expect(segs).toHaveLength(1);
    expect(segs[0]).toHaveLength(101);
  });
  it("splits at an asymptote", () => {
    expect(sampleCurve(graph("1/x").curve, -5, 5, -5, 5, 101).length).toBeGreaterThanOrEqual(2);
    expect(sampleCurve(graph("tan(x)").curve, -5, 5, -5, 5, 600).length).toBeGreaterThanOrEqual(4);
  });
});

describe("key points", () => {
  it("finds roots, intercept and extrema of x^3 − 3x", () => {
    const k = findKeyPoints(graph("x^3-3x").curve, -10, 10);
    expect(k.roots.map((p) => p.x)).toEqual([expect.closeTo(-Math.sqrt(3), 6), 0, expect.closeTo(Math.sqrt(3), 6)]);
    expect(k.yIntercept).toEqual({ x: 0, y: 0 });
    expect(k.maxima).toHaveLength(1);
    expect(k.maxima[0].x).toBeCloseTo(-1, 4);
    expect(k.maxima[0].y).toBeCloseTo(2, 6);
    expect(k.minima[0].x).toBeCloseTo(1, 4);
    expect(k.minima[0].y).toBeCloseTo(-2, 6);
  });
  it("omits the y-intercept when 0 is outside the view", () => {
    expect(findKeyPoints(graph("x").curve, 1, 5).yIntercept).toBeNull();
  });
  it("does not report the asymptote of tan(x) as a root", () => {
    const roots = findKeyPoints(graph("tan(x)").curve, -2, 2).roots;
    expect(roots.map((p) => p.x)).toEqual([0]);
  });
  it("finds intersections of x^2 and x + 2", () => {
    const pts = findIntersections(graph("x^2").curve, graph("x+2").curve, -10, 10);
    expect(pts.map((p) => p.x)).toEqual([expect.closeTo(-1, 6), expect.closeTo(2, 6)]);
    expect(pts[1].y).toBeCloseTo(4, 6);
  });
});

describe("trace and derivative", () => {
  it("gives slope and tangent of x^3 − 3x at x = 2", () => {
    const t = traceAt(graph("x^3-3x").curve, 2)!;
    expect(t.y).toBe(2);
    expect(t.slope).toBeCloseTo(9, 5);
    expect(t.intercept).toBeCloseTo(-16, 4);
    expect(traceAt(graph("sqrt(x)").curve, -1)).toBeNull();
  });
  it("derivative of sin is cos", () => {
    const d = derivativeFunction(graph("sin(x)").curve);
    expect(d(1)).toBeCloseTo(Math.cos(1), 8);
  });
});

describe("ticks and table", () => {
  it("picks nice steps", () => {
    expect(niceStep(20, 8)).toBe(2);
    expect(niceStep(1, 8)).toBe(0.1);
    expect(niceStep(100, 8)).toBe(10);
  });
  it("splits majors and minors", () => {
    const t = axisTicks(-10, 10, 8);
    expect(t.step).toBe(2);
    expect(t.major).toEqual([-10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10]);
    expect(t.minor).toContain(0.5);
    expect(t.minor).not.toContain(2);
  });
  it("builds a value table following the range and step", () => {
    const rows = valueTable(graph("x^2").curve, -1.2, 1.2, 0.5);
    expect(rows.map((r) => r.x)).toEqual([-1, -0.5, 0, 0.5, 1]);
    expect(rows[0].y).toBe(1);
    expect(rows[0].dy).toBeCloseTo(-2, 6);
    expect(rows[2].dy).toBe(0);
    expect(valueTable(graph("x").curve, 0, 1000, 1, 50)).toHaveLength(50);
    expect(valueTable(graph("sqrt(x)").curve, -1, -1, 1)[0]).toEqual({ x: -1, y: null, dy: null });
  });
});

describe("sampleSurface", () => {
  it("samples a saddle on a square grid", () => {
    const s = sampleSurface(graph("x^2-y^2").evaluate, 2, 4);
    expect(s.z).toHaveLength(25);
    expect(s.z[0]).toBe(0); // (-2, -2)
    expect(s.z[2]).toBe(-4); // (0, -2)
    expect(s.zMin).toBe(-4);
    expect(s.zMax).toBe(4);
  });
  it("pads a flat surface", () => {
    const s = sampleSurface(() => 3, 1, 2);
    expect([s.zMin, s.zMax]).toEqual([2, 4]);
  });
});
