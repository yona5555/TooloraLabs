/**
 * Charts fill with Tailwind 500/600 hexes, which fall under 4.5:1 as text on the light surfaces. On phones
 * (below 768px) text drawn in a chart's series color takes the matching hue's text class instead: 600 in light
 * and 400 in dark; important, so it beats the inline series color the desktop keeps.
 */
const TEXT_CLASS: Record<string, string> = {
  "#2563eb": "max-md:text-blue-600! max-md:dark:text-blue-400!",
  "#3b82f6": "max-md:text-blue-600! max-md:dark:text-blue-400!",
  "#0ea5e9": "max-md:text-sky-600! max-md:dark:text-sky-400!",
  "#14b8a6": "max-md:text-teal-600! max-md:dark:text-teal-400!",
  "#10b981": "max-md:text-emerald-600! max-md:dark:text-emerald-400!",
  "#059669": "max-md:text-emerald-600! max-md:dark:text-emerald-400!",
  "#22c55e": "max-md:text-green-600! max-md:dark:text-green-400!",
  "#eab308": "max-md:text-yellow-600! max-md:dark:text-yellow-400!",
  "#f59e0b": "max-md:text-amber-600! max-md:dark:text-amber-400!",
  "#f97316": "max-md:text-orange-600! max-md:dark:text-orange-400!",
  "#ef4444": "max-md:text-red-600! max-md:dark:text-red-400!",
  "#dc2626": "max-md:text-red-600! max-md:dark:text-red-400!",
  "#ec4899": "max-md:text-pink-600! max-md:dark:text-pink-400!",
  "#8b5cf6": "max-md:text-violet-600! max-md:dark:text-violet-400!",
  "#7c3aed": "max-md:text-violet-600! max-md:dark:text-violet-400!",
  "#475569": "max-md:text-slate-600! max-md:dark:text-slate-400!",
  "#64748b": "max-md:text-slate-600! max-md:dark:text-slate-400!",
  "#ea580c": "max-md:text-orange-600! max-md:dark:text-orange-400!",
  "#0891b2": "max-md:text-cyan-600! max-md:dark:text-cyan-400!",
  "#7c2d12": "max-md:text-orange-900! max-md:dark:text-orange-300!",
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
