import { HARMONY_OFFSETS, hexToRgb, hslToRgb, MONOCHROMATIC_LIGHTNESS, rgbToHex, rgbToHsl, type HarmonyType, type HSL, type RGB } from "@tooloralabs/tools";

/**
 * Pure helpers for the palette page: the tool's own harmony constants, WCAG 2.x relative luminance
 * and contrast, hex-input diagnosis for the error panel, and the standard 12 hue names of the RGB
 * colour wheel. No DOM.
 */
export const SAMPLE_HEX = "#3B82F6";
export const HARMONIES: HarmonyType[] = ["complementary", "analogous", "triadic", "splitComplementary", "tetradic", "monochromatic"];
export { HARMONY_OFFSETS, MONOCHROMATIC_LIGHTNESS };

/** Hue offsets of a harmony (monochromatic keeps the hue: one 0° entry per lightness step). */
export function offsetsOf(h: HarmonyType): number[] {
  return h === "monochromatic" ? MONOCHROMATIC_LIGHTNESS.map(() => 0) : HARMONY_OFFSETS[h];
}

export const hsl = (hex: string): HSL => rgbToHsl(hexToRgb(hex) ?? { r: 0, g: 0, b: 0 });
export const hexOfHsl = (c: HSL) => rgbToHex(hslToRgb(c));
export const wrap360 = (d: number) => ((d % 360) + 360) % 360;

/** WCAG 2.x relative luminance of an sRGB colour. */
export function luminance({ r, g, b }: RGB): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: RGB, b: RGB): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const WHITE: RGB = { r: 255, g: 255, b: 255 };
export const BLACK: RGB = { r: 0, g: 0, b: 0 };

/** The 12 named hues of the RGB colour wheel, 30° apart. */
export const HUE_NAMES = ["red", "orange", "yellow", "chartreuse", "green", "spring", "cyan", "azure", "blue", "violet", "magenta", "rose"] as const;
export type HueName = (typeof HUE_NAMES)[number];
export const hueName = (h: number): HueName => HUE_NAMES[Math.round(wrap360(h) / 30) % 12];

export type HexErrorKind = "empty" | "badChar" | "badLength";

/** Why a typed value is not a 6-digit hex colour: the first offending character, and the hex-digit count. */
export function diagnoseHex(value: string): { kind: HexErrorKind; bad: number; digits: number } {
  const v = value.trim();
  if (!v) return { kind: "empty", bad: -1, digits: 0 };
  const body = v.startsWith("#") ? v.slice(1) : v;
  const offset = v.length - body.length + (value.length - value.trimStart().length);
  const badIdx = Array.from(body).findIndex((c) => !/[0-9a-fA-F]/.test(c));
  const digits = Array.from(body).filter((c) => /[0-9a-fA-F]/.test(c)).length;
  if (badIdx >= 0) return { kind: "badChar", bad: offset + badIdx, digits };
  return { kind: "badLength", bad: -1, digits };
}

export type HexFix = { value: string; kind: "expandShorthand" | "dropAlpha" | "removeSpaces" | "replace0x" | "loadSample" };

/** The one standard repair for the common hex mistakes — only when the result is a valid 6-digit hex. */
export function proposeHexFix(value: string): HexFix | null {
  const v = value.trim();
  if (!v) return { value: SAMPLE_HEX, kind: "loadSample" };
  let fix: HexFix | null = null;
  const noSpace = v.replace(/\s+/g, "");
  if (/^0x[0-9a-fA-F]{6}$/i.test(noSpace)) fix = { value: `#${noSpace.slice(2).toUpperCase()}`, kind: "replace0x" };
  else if (noSpace !== v && /^#?[0-9a-fA-F]{6}$/.test(noSpace)) fix = { value: (noSpace.startsWith("#") ? noSpace : `#${noSpace}`).toUpperCase(), kind: "removeSpaces" };
  else if (/^#?[0-9a-fA-F]{3}$/.test(v)) {
    const b = v.replace("#", "");
    fix = { value: `#${b[0]}${b[0]}${b[1]}${b[1]}${b[2]}${b[2]}`.toUpperCase(), kind: "expandShorthand" };
  } else if (/^#?[0-9a-fA-F]{8}$/.test(v)) fix = { value: `#${v.replace("#", "").slice(0, 6)}`.toUpperCase(), kind: "dropAlpha" };
  return fix && /^#[0-9A-F]{6}$/.test(fix.value) ? fix : null;
}
