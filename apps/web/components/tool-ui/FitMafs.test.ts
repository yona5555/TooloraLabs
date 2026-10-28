// FitMafs' view: Mafs' own padding/contain rule solved for pixel margins around the area of interest.
import { describe, expect, it } from "vitest";
import { fitView } from "./FitMafs";

const none = { left: 0, right: 0, top: 0, bottom: 0 };

describe("fitView", () => {
  it("is Mafs' own view with no margins (padding 0.5, stretched)", () => {
    expect(fitView({ x: [-3, 3], y: [-15, 15] }, false, 320, 300, none)).toEqual({ x: [-3.5, 3.5], y: [-15.5, 15.5] });
  });
  it("keeps the requested px free on each side when stretched", () => {
    const v = fitView({ x: [-3, 3], y: [0, 10], padding: 0 }, false, 320, 200, { left: 20, right: 10, top: 8, bottom: 16 });
    const ux = (v.x[1] - v.x[0]) / 320;
    const uy = (v.y[1] - v.y[0]) / 200;
    expect((-3 - v.x[0]) / ux).toBeCloseTo(20);
    expect((v.x[1] - 3) / ux).toBeCloseTo(10);
    expect((0 - v.y[0]) / uy).toBeCloseTo(16);
    expect((v.y[1] - 10) / uy).toBeCloseTo(8);
  });
  it("uses one scale for both axes under contain, so Mafs changes nothing further", () => {
    const v = fitView({ x: [-4, 4], y: [-4, 4], padding: 0 }, true, 400, 340, { left: 10, right: 10, top: 10, bottom: 10 });
    expect((v.x[1] - v.x[0]) / 400).toBeCloseTo((v.y[1] - v.y[0]) / 340);
  });
});
