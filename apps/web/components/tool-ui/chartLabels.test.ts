// The shared chart label geometry: margins from measured overflow, data ranges from margins, side choice,
// clamping, thinning, RTL sides and label bands.
import { describe, expect, it } from "vitest";
import { LABEL_GAP, NO_MARGINS, clampInto, placeBeside, labelUnits, nextMargins, overflowOf, padRange, physicalSide, pickSide, stackBands, thinEvery } from "./chartLabels";

const frame = { left: 0, right: 300, top: 0, bottom: 200 };

describe("overflowOf", () => {
  it("measures how far shown labels cross each edge (negative = room left)", () => {
    const o = overflowOf([{ left: -11, right: 11, top: 150, bottom: 167 }, { left: 280, right: 309, top: -6, bottom: 9 }], frame);
    expect(o).toEqual({ left: 11, right: 9, top: 6, bottom: -33 });
  });
  it("ignores a label entirely outside the drawing (never shown)", () => {
    const o = overflowOf([{ left: -64, right: -42, top: 150, bottom: 167 }, { left: 10, right: 20, top: 10, bottom: 20 }], frame);
    expect(o.left).toBe(-10);
  });
});

describe("nextMargins", () => {
  it("grows by the overflow plus the gap, and returns the same object once stable", () => {
    const m = nextMargins(NO_MARGINS, { left: 11, right: -5, top: 6, bottom: -40 });
    expect(m).toEqual({ left: 11 + LABEL_GAP, right: 0, top: 6 + LABEL_GAP, bottom: 0 });
    const stable = nextMargins(m, { left: -LABEL_GAP, right: -LABEL_GAP, top: -LABEL_GAP, bottom: -9 });
    expect(stable).toBe(m);
  });
  it("shrinks when labels have room, unless growOnly", () => {
    const cur = { left: 20, right: 0, top: 0, bottom: 0 };
    expect(nextMargins(cur, { left: -10, right: -9, top: -9, bottom: -9 }).left).toBe(10 + LABEL_GAP);
    expect(nextMargins(cur, { left: -10, right: -9, top: -9, bottom: -9 }, true)).toBe(cur);
  });
});

describe("padRange", () => {
  it("keeps the requested px free at both ends", () => {
    const [a, b] = padRange([-3, 3], 320, 20, 10);
    const pxPerUnit = 320 / (b - a);
    expect((-3 - a) * pxPerUnit).toBeCloseTo(20);
    expect((b - 3) * pxPerUnit).toBeCloseTo(10);
  });
  it("leaves the range alone before the drawing is measured", () => {
    expect(padRange([-3, 3], 0, 20, 10)).toEqual([-3, 3]);
  });
});

describe("pickSide / clampInto", () => {
  it("keeps the preferred side when it fits and flips when it does not", () => {
    expect(pickSide(100, 48, 0, 300, "after")).toBe("after");
    expect(pickSide(282, 48, 0, 300, "after")).toBe("before");
  });
  it("pulls the anchor in when even the flipped label would cross the edge", () => {
    const p = placeBeside(340, 48, 0, 300, "after");
    expect(p.side).toBe("before");
    expect(p.at - LABEL_GAP).toBeLessThanOrEqual(300);
    expect(p.at - LABEL_GAP - 48).toBeGreaterThanOrEqual(0);
    expect(placeBeside(100, 48, 0, 300, "after")).toEqual({ side: "after", at: 100 });
  });
  it("moves a centred label the least to stay inside", () => {
    expect(clampInto(5, 20, 0, 200)).toBe(10);
    expect(clampInto(100, 20, 0, 200)).toBe(100);
    expect(clampInto(198, 20, 0, 200)).toBe(190);
  });
});

describe("thinEvery / physicalSide / labelUnits / stackBands", () => {
  it("thins tick labels by measured width, never below every label", () => {
    expect(thinEvery(53, 22)).toBe(1);
    expect(thinEvery(20, 30)).toBe(2);
  });
  it("resolves logical sides for the page direction", () => {
    expect(physicalSide("start", false)).toBe("left");
    expect(physicalSide("start", true)).toBe("right");
    expect(physicalSide("end", true)).toBe("left");
  });
  it("mirrors svgPx: never below 12 rendered px", () => {
    expect(labelUnits(12, 1)).toBe(12);
    expect(labelUnits(12, 1.25)).toBe(15);
    expect(labelUnits(14, 1)).toBe(14);
  });
  it("stacks header, plot and footer bands without touching", () => {
    const b = stackBands(200, { ascent: 9, descent: 2 }, { ascent: 9, descent: 3 }, 4);
    expect(b).toEqual({ headerBase: 13, footerBase: 193, plotTop: 19, plotBottom: 180 });
  });
});
