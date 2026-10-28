// The shared chart label geometry: margins from measured overflow, data ranges from margins, side choice,
// clamping, thinning, RTL sides and label bands.
import { describe, expect, it } from "vitest";
import { LABEL_GAP, NO_MARGINS, clampInto, fitStep, placeBeside, placeClear, labelUnits, marginDelta, nextMargins, padRange, physicalSide, pickSide, stackBands, thinEvery } from "./chartLabels";

const frame = { left: 0, right: 300, top: 0, bottom: 200 };

describe("marginDelta", () => {
  it("grows each side by how far a label centred inside crosses it, plus the gap", () => {
    const d = marginDelta([{ left: -11, right: 11, top: 150, bottom: 167 }, { left: 280, right: 309, top: -6, bottom: 9 }], frame, NO_MARGINS);
    expect(d).toEqual({ left: 11 + LABEL_GAP, right: 9 + LABEL_GAP, top: 6 + LABEL_GAP, bottom: 0 });
  });
  it("gives back room it no longer needs, never below a 0 margin", () => {
    const d = marginDelta([{ left: 30, right: 50, top: 50, bottom: 60 }], frame, { left: 20, right: 0, top: 0, bottom: 0 });
    expect(d.left).toBe(-20);
    expect(d.right).toBe(0);
  });
  it("ignores a label entirely outside the drawing (never shown)", () => {
    const d = marginDelta([{ left: -64, right: -42, top: 150, bottom: 167 }, { left: 10, right: 20, top: 10, bottom: 20 }], frame, NO_MARGINS);
    expect(d.left).toBe(0);
  });
  it("pushes the next tick's label out when that moves the edge less than pulling it in", () => {
    // "−6" centred 7px left of the edge, 22px wide: 4px of ink inside; the margin is 20px
    const floor = { left: -12, right: -12, top: -12, bottom: -12 }; // a view padded 12px past its area of interest
    const d = marginDelta([{ left: -18, right: 4, top: 72, bottom: 84 }, { left: 30, right: 52, top: 72, bottom: 84 }], frame, { left: 20, right: 0, top: 0, bottom: 0 }, floor);
    expect(d.left).toBe(-(4 + LABEL_GAP));
  });
  it("never pushes out a label without a padding floor (nothing lies past the area of interest)", () => {
    const d = marginDelta([{ left: -18, right: 4, top: 72, bottom: 84 }, { left: 30, right: 52, top: 72, bottom: 84 }], frame, { left: 20, right: 0, top: 0, bottom: 0 });
    expect(d.left).toBe(18 + LABEL_GAP);
  });
  it("pulls a label in when pushing it out would need a negative margin", () => {
    const d = marginDelta([{ left: -18, right: 4, top: 72, bottom: 84 }], frame, NO_MARGINS);
    expect(d.left).toBe(18 + LABEL_GAP);
  });
});

describe("nextMargins", () => {
  it("applies the change, rounded, and returns the same object once stable", () => {
    const m = nextMargins(NO_MARGINS, { left: 15, right: -5, top: 10.2, bottom: 0 });
    expect(m).toEqual({ left: 15, right: 0, top: 10, bottom: 0 });
    expect(nextMargins(m, { left: 0.2, right: 0, top: -0.2, bottom: 0 })).toBe(m);
  });
  it("keeps the last layout once frozen", () => {
    const cur = { left: 20, right: 0, top: 0, bottom: 0 };
    expect(nextMargins(cur, { left: -10, right: 5, top: 0, bottom: 0 }, true)).toBe(cur);
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

describe("placeClear / fitStep", () => {
  it("stays put when clear, else takes the least move off the other labels and inside the drawing", () => {
    const box = { left: 100, right: 140, top: 50, bottom: 62 };
    expect(placeClear(box, [], frame, { x: 20, y: 12 })).toEqual({ dx: 0, dy: 0 });
    const hit = placeClear(box, [{ left: 110, right: 150, top: 52, bottom: 64 }], frame, { x: 20, y: 12 });
    expect(hit).toEqual({ dx: 0, dy: -24 });
  });
  it("pulls a label crossing the edge back inside", () => {
    const m = placeClear({ left: 290, right: 320, top: 50, bottom: 62 }, [], frame, { x: 15, y: 12 });
    expect(320 + m.dx).toBeLessThanOrEqual(300 - LABEL_GAP);
  });
  it("shares the container width between the items, with a server fallback", () => {
    expect(fitStep(872, 72, 40, 22)).toBe(20);
    expect(fitStep(0, 72, 40, 22)).toBe(22);
  });
});
