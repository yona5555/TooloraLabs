/** Fill colours per style, in TEXT_LOGO_STYLES order (matches the strokes of TlStyleRings). */
export const STYLE_FILLS = [
  "fill-blue-600 dark:fill-blue-400",
  "fill-violet-500 dark:fill-violet-400",
  "fill-fuchsia-500 dark:fill-fuchsia-400",
  "fill-emerald-500 dark:fill-emerald-400",
  "fill-amber-500 dark:fill-amber-400",
  "fill-cyan-500 dark:fill-cyan-400",
  "fill-rose-500 dark:fill-rose-400",
];

import { TextLogoCalculator, type TextLogoStyle } from "@tooloralabs/tools";

const tool = new TextLogoCalculator();

/** "Aa" in the given style — a language-free label for compact charts. */
export function styleSample(style: TextLogoStyle | null): string {
  return style ? tool.execute({ text: "Aa", style }, { locale: "en-US" }).data.styledText : "Aa";
}
