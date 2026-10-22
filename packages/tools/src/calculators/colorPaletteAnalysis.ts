/**
 * Colour science behind the Color Palette Generator's indicators: WCAG 2.x relative luminance and
 * contrast, CIE L*a*b* / LCh (D65), CIE76 colour differences, colour-vision-deficiency simulation
 * (Machado, Oliveira & Fernandes 2009, severity 1.0) and a lightness ramp of the base hue.
 */
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl, type HSL, type RGB } from "./ColorPaletteGenerator";

export type WcagLevel = "AAA" | "AA" | "AA-large" | "fail";
export type CvdType = "protanopia" | "deuteranopia" | "tritanopia";
export const CVD_TYPES: CvdType[] = ["protanopia", "deuteranopia", "tritanopia"];

export type Lab = { L: number; a: number; b: number };

export type ColorInfo = {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  lab: Lab;
  /** CIE LCh chroma and hue angle (degrees). */
  chroma: number;
  hueLab: number;
  luminance: number;
  contrastWhite: number;
  contrastBlack: number;
  bestText: "white" | "black";
  bestContrast: number;
  level: WcagLevel;
};

export type PalettePair = { i: number; j: number; contrast: number; deltaE: number };

export type PaletteAnalysis = {
  colors: ColorInfo[];
  /** Index of the palette colour closest to the base colour (the base itself unless monochromatic). */
  baseIndex: number;
  pairs: PalettePair[];
  /** For each deficiency: the simulated hexes and the smallest CIE76 distance left between any two colours. */
  cvd: Record<CvdType, { hexes: string[]; minDeltaE: number }>;
  minDeltaE: number;
  /** The base hue at lightness 5 %…95 % (saturation kept), with contrast against white text. */
  ramp: { l: number; hex: string; contrastWhite: number; contrastBlack: number }[];
};

const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const gam = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/** WCAG 2.x relative luminance (sRGB, threshold 0.04045 as in IEC 61966-2-1). */
export function relativeLuminance(rgb: RGB): number {
  return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function wcagLevel(ratio: number): WcagLevel {
  return ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA-large" : "fail";
}

/** sRGB → CIE L*a*b* with the D65 white point. */
export function rgbToLab(rgb: RGB): Lab {
  const r = lin(rgb.r);
  const g = lin(rgb.g);
  const b = lin(rgb.b);
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function deltaE76(p: Lab, q: Lab): number {
  return Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b);
}

const CVD_MATRICES: Record<CvdType, number[][]> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

/** Simulates how a colour appears with full protanopia, deuteranopia or tritanopia (applied in linear RGB). */
export function simulateCvd(rgb: RGB, type: CvdType): RGB {
  const v = [lin(rgb.r), lin(rgb.g), lin(rgb.b)];
  const m = CVD_MATRICES[type];
  const out = m.map((row) => Math.min(1, Math.max(0, row[0] * v[0] + row[1] * v[1] + row[2] * v[2])));
  return { r: Math.round(gam(out[0])), g: Math.round(gam(out[1])), b: Math.round(gam(out[2])) };
}

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };

function info(hex: string): ColorInfo {
  const rgb = hexToRgb(hex) as RGB;
  const lab = rgbToLab(rgb);
  const contrastWhite = contrastRatio(rgb, WHITE);
  const contrastBlack = contrastRatio(rgb, BLACK);
  const bestText = contrastWhite >= contrastBlack ? "white" : "black";
  const bestContrast = Math.max(contrastWhite, contrastBlack);
  return {
    hex: rgbToHex(rgb),
    rgb,
    hsl: rgbToHsl(rgb),
    lab,
    chroma: Math.hypot(lab.a, lab.b),
    hueLab: ((Math.atan2(lab.b, lab.a) * 180) / Math.PI + 360) % 360,
    luminance: relativeLuminance(rgb),
    contrastWhite,
    contrastBlack,
    bestText,
    bestContrast,
    level: wcagLevel(bestContrast),
  };
}

function minPairDistance(labs: Lab[]): number {
  let min = Infinity;
  for (let i = 0; i < labs.length; i++) for (let j = i + 1; j < labs.length; j++) min = Math.min(min, deltaE76(labs[i], labs[j]));
  return Number.isFinite(min) ? min : 0;
}

export function analyzePalette(hexes: string[], baseHex: string): PaletteAnalysis {
  const colors = hexes.map(info);
  const pairs: PalettePair[] = [];
  for (let i = 0; i < colors.length; i++)
    for (let j = i + 1; j < colors.length; j++) pairs.push({ i, j, contrast: contrastRatio(colors[i].rgb, colors[j].rgb), deltaE: deltaE76(colors[i].lab, colors[j].lab) });

  const cvd = Object.fromEntries(
    CVD_TYPES.map((type) => {
      const sim = colors.map((c) => simulateCvd(c.rgb, type));
      return [type, { hexes: sim.map(rgbToHex), minDeltaE: minPairDistance(sim.map(rgbToLab)) }];
    }),
  ) as PaletteAnalysis["cvd"];

  const baseLab = rgbToLab(hexToRgb(baseHex) as RGB);
  const baseIndex = colors.reduce((best, c, i) => (deltaE76(c.lab, baseLab) < deltaE76(colors[best].lab, baseLab) ? i : best), 0);
  const base = rgbToHsl(hexToRgb(baseHex) as RGB);
  const ramp = Array.from({ length: 19 }, (_, k) => {
    const l = 5 + k * 5;
    const rgb = hslToRgb({ h: base.h, s: base.s, l });
    return { l, hex: rgbToHex(rgb), contrastWhite: contrastRatio(rgb, WHITE), contrastBlack: contrastRatio(rgb, BLACK) };
  });

  return { colors, baseIndex, pairs, cvd, minDeltaE: minPairDistance(colors.map((c) => c.lab)), ramp };
}
