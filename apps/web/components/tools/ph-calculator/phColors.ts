import { mixHex, type TokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";

export const UI_TOKENS = Array.from({ length: 15 }, (_, i) => `--ph-ui-${i}`);

/** Universal-indicator colour at a pH from resolved tokens. */
export function uiHex(colors: TokenColors, pH: number): string {
  const p = Math.min(14, Math.max(0, pH));
  const lo = Math.floor(p);
  const hi = Math.min(14, lo + 1);
  return mixHex(colors[`--ph-ui-${lo}`], colors[`--ph-ui-${hi}`], p - lo);
}
