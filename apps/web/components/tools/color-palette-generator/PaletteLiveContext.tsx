"use client";
import { useMemo } from "react";
import { analyzePalette, generateColorPalette, isValidHex, type HarmonyType, type PaletteAnalysis, type PaletteColor } from "@tooloralabs/tools";
import { createLiveToolState } from "@/lib/create-live-tool-state";

export type PaletteDraft = { baseHex: string; harmony: HarmonyType };

export const PALETTE_DEFAULTS: PaletteDraft = { baseHex: "#3B82F6", harmony: "complementary" };

/** Published reference colours: Pantone Colors of the Year (their official sRGB values) and Tailwind blue-500. */
export const PALETTE_EXAMPLES: { id: string; baseHex: string; harmony: HarmonyType }[] = [
  { id: "tailwind", baseHex: "#3B82F6", harmony: "complementary" },
  { id: "classicBlue", baseHex: "#0F4C81", harmony: "analogous" },
  { id: "vivaMagenta", baseHex: "#BB2649", harmony: "triadic" },
  { id: "peachFuzz", baseHex: "#FFBE98", harmony: "splitComplementary" },
  { id: "mochaMousse", baseHex: "#A47864", harmony: "monochromatic" },
];

export const { LiveProvider: PaletteLiveProvider, useLiveState: usePaletteLive } = createLiveToolState<PaletteDraft>();

export type PaletteModel = {
  draft: PaletteDraft;
  valid: boolean;
  palette: PaletteColor[];
  /** null when the base hex is invalid. */
  a: PaletteAnalysis | null;
  f: (v: number, max?: number) => string;
};

const nf = (v: number, max = 2) => v.toLocaleString("en-US", { maximumFractionDigits: max });

export function buildPaletteModel(d: PaletteDraft): PaletteModel {
  const valid = isValidHex(d.baseHex);
  const palette = valid ? generateColorPalette(d.baseHex, d.harmony) : [];
  const base = d.baseHex.startsWith("#") ? d.baseHex : `#${d.baseHex}`;
  return {
    draft: d,
    valid,
    palette,
    a: valid
      ? analyzePalette(
          palette.map((c) => c.hex),
          base,
        )
      : null,
    f: nf,
  };
}

export function usePaletteModel(): PaletteModel {
  const { dims } = usePaletteLive();
  return useMemo(() => buildPaletteModel(dims), [dims]);
}

/** "1", "2", … labels used for palette colours across indicators. */
export const swatchLabel = (i: number) => String(i + 1);

/** Rounds an SVG coordinate to 0.01 px: colour maths uses pow/cbrt/log, whose last digits differ between server and browser. */
export const px2 = (v: number) => Math.round(v * 100) / 100;
