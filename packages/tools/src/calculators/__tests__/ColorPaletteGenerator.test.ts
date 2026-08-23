import { describe, it, expect } from "vitest";
import {
  isValidHex,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  generateColorPalette,
  generateRandomHex,
} from "../ColorPaletteGenerator";

describe("hex/rgb/hsl conversions", () => {
  it("validates hex strings with and without a leading #", () => {
    expect(isValidHex("#3B82F6")).toBe(true);
    expect(isValidHex("3B82F6")).toBe(true);
    expect(isValidHex("#3B82")).toBe(false);
    expect(isValidHex("not-a-color")).toBe(false);
  });

  it("converts hex to rgb correctly", () => {
    expect(hexToRgb("#3B82F6")).toEqual({ r: 59, g: 130, b: 246 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("invalid")).toBeNull();
  });

  it("round-trips rgb through hsl back to rgb", () => {
    const rgb = { r: 59, g: 130, b: 246 };
    const hsl = rgbToHsl(rgb);
    const roundTripped = hslToRgb(hsl);
    expect(roundTripped.r).toBeCloseTo(rgb.r, 0);
    expect(roundTripped.g).toBeCloseTo(rgb.g, 0);
    expect(roundTripped.b).toBeCloseTo(rgb.b, 0);
  });

  it("converts rgb back to hex", () => {
    expect(rgbToHex({ r: 59, g: 130, b: 246 })).toBe("#3b82f6");
  });
});

describe("generateColorPalette", () => {
  it("generates a complementary pair at 180 degrees apart", () => {
    const palette = generateColorPalette("#3B82F6", "complementary");
    expect(palette).toHaveLength(2);
    expect(palette[0].hex).toBe("#3b82f6");
    expect(palette[1].hex).toBe("#f6af3b");
  });

  it("generates three analogous colors", () => {
    const palette = generateColorPalette("#3B82F6", "analogous");
    expect(palette).toHaveLength(3);
    expect(palette[1].hex).toBe("#3b82f6");
  });

  it("generates three triadic colors 120 degrees apart", () => {
    const palette = generateColorPalette("#3B82F6", "triadic");
    expect(palette).toHaveLength(3);
    expect(palette[0].hex).toBe("#3b82f6");
    expect(palette[1].hex).toBe("#f63b82");
    expect(palette[2].hex).toBe("#82f63b");
  });

  it("generates four tetradic colors 90 degrees apart", () => {
    const palette = generateColorPalette("#3B82F6", "tetradic");
    expect(palette).toHaveLength(4);
  });

  it("generates five monochromatic shades at the same hue", () => {
    const palette = generateColorPalette("#3B82F6", "monochromatic");
    expect(palette).toHaveLength(5);
    const hues = palette.map((c) => rgbToHsl(hexToRgb(c.hex)!).h);
    for (const h of hues) {
      expect(h).toBeCloseTo(hues[0], 0);
    }
  });

  it("returns an empty array for an invalid hex", () => {
    expect(generateColorPalette("not-a-color", "complementary")).toEqual([]);
  });
});

describe("generateRandomHex", () => {
  it("always returns a valid 6-digit hex color", () => {
    for (let i = 0; i < 20; i++) {
      expect(isValidHex(generateRandomHex())).toBe(true);
    }
  });
});
