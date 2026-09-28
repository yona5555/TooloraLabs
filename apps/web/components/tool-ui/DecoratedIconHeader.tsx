import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Shared decorated card header — see TooloraLabs-Claude-Instructions.md §34.
 * A solid-color block with a centered, enlarged icon (inside a light
 * "raised button" badge) and a scatter of non-repeating decorative glyphs
 * from three pools (math, financial, geometric). The scatter is generated
 * deterministically from `seed` (typically the category or tool slug) via a
 * tiny seeded PRNG — never hand-authored per item, so adding a category or
 * tool never means writing new decoration code, and the same seed always
 * renders the same layout (stable across server re-renders, no client
 * hooks needed).
 *
 * Purely presentational — this header has no hover behavior of its own.
 * The whole-card hover reveal (both the tool-card and category-card
 * variants) lives one level up, in the card component wrapping this
 * header, which layers an opaque overlay on top of the entire card
 * (header included) on hover — see DecoratedToolCard.tsx and
 * HeroCategories.tsx.
 */

const MATH_SYMBOLS = ["+", "−", "×", "÷", "=", "%"];
const FINANCIAL_SYMBOLS = ["$", "€", "¢", "£"];
const GEOMETRIC_SYMBOLS = ["△", "○", "□", "◇"];
const SYMBOL_POOL = [...MATH_SYMBOLS, ...FINANCIAL_SYMBOLS, ...GEOMETRIC_SYMBOLS];

const SIZE_CLASSES = ["text-[11px] sm:text-xs", "text-xs sm:text-sm", "text-sm sm:text-base", "text-sm sm:text-lg"];
// Icon and decoration are always dark now (§34 revision) — every palette color in
// lib/category-palette.ts is a calm/pastel tone, and dark reads more clearly on all
// of them than white did on the ones near the light end of the palette.
const OPACITY_DARK = ["text-black/20", "text-black/25", "text-black/30", "text-black/35"];
const ICON_COLOR_CLASS = "text-[#161616]";
// Soft "raised button" badge behind the icon (2026-09-30) — a light circle with an
// embossed two-tone shadow (dark offset one side, light highlight the other), same in
// both themes since the reference is a light-UI icon-set look, not theme-derived.
const ICON_BADGE_CLASS =
  "rounded-full bg-[#dcd9d2] shadow-[3px_4px_10px_rgba(0,0,0,0.2),-3px_-3px_8px_rgba(255,255,255,0.7)] ring-1 ring-black/5";

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type DecoratedIconHeaderSize = "compact" | "regular" | "small";

const SIZE_CONFIG: Record<
  DecoratedIconHeaderSize,
  { heightClass: string; iconSize: number; iconClass: string; symbolCount: number; badgeClass: string }
> = {
  compact: { heightClass: "h-16 sm:h-[4.5rem]", iconSize: 30, iconClass: "sm:h-9 sm:w-9", symbolCount: 11, badgeClass: "h-10 w-10 sm:h-11 sm:w-11" },
  regular: { heightClass: "h-24", iconSize: 34, iconClass: "", symbolCount: 13, badgeClass: "h-16 w-16" },
  small: { heightClass: "h-14", iconSize: 22, iconClass: "", symbolCount: 7, badgeClass: "h-10 w-10" },
};

type DecoratedIconHeaderProps = {
  colorHex: string;
  /** Kept for API compatibility with the palette's per-color contrast decision; icon/decoration color is always dark (see module comment), so this doesn't change header rendering — callers still use it for their own hover-overlay text. */
  textVariant: "white" | "dark";
  Icon: LucideIcon;
  seed: string;
  size?: DecoratedIconHeaderSize;
};

export default function DecoratedIconHeader({ colorHex, Icon, seed, size = "regular" }: DecoratedIconHeaderProps) {
  const cfg = SIZE_CONFIG[size];
  const rng = mulberry32(hashSeed(seed));
  const symbols = shuffle(SYMBOL_POOL, rng).slice(0, cfg.symbolCount);

  return (
    <div className={`relative flex ${cfg.heightClass} items-center justify-center overflow-hidden`} style={{ backgroundColor: colorHex }}>
      <div className={`relative z-10 flex items-center justify-center ${ICON_BADGE_CLASS} ${cfg.badgeClass}`}>
        <Icon size={cfg.iconSize} strokeWidth={1.75} className={`${ICON_COLOR_CLASS} ${cfg.iconClass}`} />
      </div>

      <span className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        {symbols.map((sym, i) => {
          const useTop = rng() < 0.5;
          const vertical = 2 + rng() * 30;
          const sideLeft = rng() < 0.5;
          const horizontal = 3 + rng() * 34;
          const sizeClass = SIZE_CLASSES[Math.floor(rng() * SIZE_CLASSES.length)];
          const opacityClass = OPACITY_DARK[Math.floor(rng() * OPACITY_DARK.length)];
          const style: CSSProperties = {
            [useTop ? "top" : "bottom"]: `${vertical}%`,
            [sideLeft ? "left" : "right"]: `${horizontal}%`,
          };
          return (
            <span key={i} className={`absolute font-bold ${sizeClass} ${opacityClass}`} style={style}>
              {sym}
            </span>
          );
        })}
      </span>
    </div>
  );
}
