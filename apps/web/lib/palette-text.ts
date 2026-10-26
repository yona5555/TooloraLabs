/**
 * Charts fill with Tailwind 500/600 hexes, which fall under 4.5:1 as text on the light surfaces. Text
 * drawn in a chart's series color takes the matching hue's text class instead: 600 in light (the AA
 * tokens in globals.css) and 400 in dark.
 */
const TEXT_CLASS: Record<string, string> = {
  "#2563eb": "text-blue-600 dark:text-blue-400",
  "#3b82f6": "text-blue-600 dark:text-blue-400",
  "#0ea5e9": "text-sky-600 dark:text-sky-400",
  "#14b8a6": "text-teal-600 dark:text-teal-400",
  "#10b981": "text-emerald-600 dark:text-emerald-400",
  "#059669": "text-emerald-600 dark:text-emerald-400",
  "#22c55e": "text-green-600 dark:text-green-400",
  "#eab308": "text-yellow-600 dark:text-yellow-400",
  "#f59e0b": "text-amber-600 dark:text-amber-400",
  "#f97316": "text-orange-600 dark:text-orange-400",
  "#ef4444": "text-red-600 dark:text-red-400",
  "#dc2626": "text-red-600 dark:text-red-400",
  "#ec4899": "text-pink-600 dark:text-pink-400",
  "#8b5cf6": "text-violet-600 dark:text-violet-400",
  "#7c3aed": "text-violet-600 dark:text-violet-400",
  "#475569": "text-slate-600 dark:text-slate-400",
  "#64748b": "text-slate-600 dark:text-slate-400",
  "#ea580c": "text-orange-600 dark:text-orange-400",
  "#0891b2": "text-cyan-600 dark:text-cyan-400",
  "#7c2d12": "text-orange-900 dark:text-orange-300",
};

/** The AA text class for a palette hex; throws on a hex not in the table so a new color is added here. */
export function paletteTextClass(hex: string): string {
  const cls = TEXT_CLASS[hex.toLowerCase()];
  if (!cls) throw new Error(`paletteTextClass: no text class for ${hex}`);
  return cls;
}

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16) / 255) + 0.7152 * lin(((n >> 8) & 255) / 255) + 0.0722 * lin((n & 255) / 255);
}

/** The label color for text drawn on a solid #rrggbb fill: white or zinc-900, whichever contrasts more. */
export function inkOn(fill: string): string {
  const l = luminance(fill);
  return 1.05 / (l + 0.05) >= (l + 0.05) / (luminance("#18181b") + 0.05) ? "#ffffff" : "#18181b";
}
