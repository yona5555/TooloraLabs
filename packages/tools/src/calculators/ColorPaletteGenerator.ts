export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export type PaletteColor = {
  hex: string;
  rgb: string;
  hsl: string;
};

export type HarmonyType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "splitComplementary"
  | "tetradic"
  | "monochromatic";

const HEX_PATTERN = /^#?([0-9a-fA-F]{6})$/;

export function isValidHex(hex: string): boolean {
  return HEX_PATTERN.test(hex.trim());
}

export function hexToRgb(hex: string): RGB | null {
  const match = HEX_PATTERN.exec(hex.trim());
  if (!match) return null;
  const clean = match[1];
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export function rgbToHex(rgb: RGB): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[rgb.r, rgb.g, rgb.b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = ((hsl.h % 360) + 360) % 360 / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function shiftHue(hsl: HSL, degrees: number): HSL {
  return { h: ((hsl.h + degrees) % 360 + 360) % 360, s: hsl.s, l: hsl.l };
}

function toColor(hsl: HSL): PaletteColor {
  const rgb = hslToRgb(hsl);
  return {
    hex: rgbToHex(rgb),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
  };
}

const HARMONY_OFFSETS: Record<Exclude<HarmonyType, "monochromatic">, number[]> = {
  complementary: [0, 180],
  analogous: [-30, 0, 30],
  triadic: [0, 120, 240],
  splitComplementary: [0, 150, 210],
  tetradic: [0, 90, 180, 270],
};

const MONOCHROMATIC_LIGHTNESS = [20, 35, 50, 65, 80];

/**
 * Generates a color palette from a base hex color using classic color-wheel
 * harmony rules: pairs or groups of hues at fixed angular offsets around the
 * HSL hue circle (complementary at 180°, triadic at 120° intervals, etc.),
 * with monochromatic instead varying lightness at a constant hue and
 * saturation. Returns an empty array for an invalid hex input.
 */
export function generateColorPalette(baseHex: string, harmony: HarmonyType): PaletteColor[] {
  const rgb = hexToRgb(baseHex);
  if (!rgb) return [];

  const baseHsl = rgbToHsl(rgb);

  if (harmony === "monochromatic") {
    return MONOCHROMATIC_LIGHTNESS.map((l) => toColor({ h: baseHsl.h, s: baseHsl.s, l }));
  }

  return HARMONY_OFFSETS[harmony].map((offset) => toColor(shiftHue(baseHsl, offset)));
}

export function generateRandomHex(): string {
  const rgb: RGB = {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
  return rgbToHex(rgb);
}
