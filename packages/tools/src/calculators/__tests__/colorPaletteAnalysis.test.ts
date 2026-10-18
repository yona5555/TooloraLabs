import { describe, expect, it } from "vitest";
import { analyzePalette, contrastRatio, deltaE76, rgbToLab, simulateCvd, wcagLevel } from "../colorPaletteAnalysis";
import { generateColorPalette } from "../ColorPaletteGenerator";

describe("colour science", () => {
  it("matches WCAG reference contrasts", () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 6);
    // #767676 on white is the classic 4.54:1 AA grey.
    expect(contrastRatio({ r: 118, g: 118, b: 118 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(4.54, 2);
    expect(wcagLevel(4.5)).toBe("AA");
    expect(wcagLevel(3.2)).toBe("AA-large");
  });

  it("converts to CIELAB (D65)", () => {
    const white = rgbToLab({ r: 255, g: 255, b: 255 });
    expect(white.L).toBeCloseTo(100, 2);
    expect(Math.abs(white.a)).toBeLessThan(0.01);
    const red = rgbToLab({ r: 255, g: 0, b: 0 });
    expect(red.L).toBeCloseTo(53.24, 1);
    expect(red.a).toBeCloseTo(80.09, 1);
    expect(red.b).toBeCloseTo(67.2, 1);
    expect(deltaE76(white, white)).toBe(0);
  });

  it("simulates colour-vision deficiency and keeps greys grey", () => {
    const grey = simulateCvd({ r: 128, g: 128, b: 128 }, "deuteranopia");
    expect(Math.abs(grey.r - 128)).toBeLessThanOrEqual(2);
    const red = simulateCvd({ r: 255, g: 0, b: 0 }, "protanopia");
    expect(red.r).toBeLessThan(160);
  });

  it("analyses a real palette", () => {
    const hexes = generateColorPalette("#3B82F6", "triadic").map((c) => c.hex);
    const a = analyzePalette(hexes, "#3B82F6");
    expect(a.colors).toHaveLength(3);
    expect(a.pairs).toHaveLength(3);
    expect(a.colors[0].hex).toBe("#3b82f6");
    expect(a.baseIndex).toBe(0);
    expect(analyzePalette(generateColorPalette("#3B82F6", "analogous").map((c) => c.hex), "#3B82F6").baseIndex).toBe(1);
    expect(a.colors[0].bestContrast).toBeGreaterThan(3);
    expect(a.ramp).toHaveLength(19);
    expect(a.cvd.deuteranopia.minDeltaE).toBeGreaterThan(0);
    expect(a.cvd.deuteranopia.hexes).toHaveLength(3);
  });
});
