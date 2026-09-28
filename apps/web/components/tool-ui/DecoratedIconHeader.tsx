import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Shared decorated card header — see TooloraLabs-Claude-Instructions.md §34.
 * A solid-color block with a centered, enlarged icon and a scatter of
 * non-repeating decorative glyphs from three pools (math, financial,
 * geometric). The scatter is generated deterministically from `seed`
 * (typically the category or tool slug) via a tiny seeded PRNG — never
 * hand-authored per item, so adding a category or tool never means writing
 * new decoration code, and the same seed always renders the same layout
 * (stable across server re-renders, no client hooks needed).
 *
 * Hovering the icon (a small hitbox, not the whole card) fades out the icon
 * and decoration and reveals the item's title + a short description filling
 * the *entire* colored header block, in text colored directly against the
 * header's own background (`textVariant`, the palette's precomputed
 * light/dark contrast decision) — no intervening white pill. Pure CSS
 * (`peer`/`peer-hover`, `group`/`group-hover`), no client component needed.
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
  {
    heightClass: string;
    iconSize: number;
    iconClass: string;
    symbolCount: number;
    hoverZoneClass: string;
    titleTextClass: string;
    descTextClass: string;
    descLineClamp: string;
    overlayPadding: string;
  }
> = {
  compact: {
    heightClass: "h-16 sm:h-[4.5rem]",
    iconSize: 30,
    iconClass: "sm:h-9 sm:w-9",
    symbolCount: 11,
    hoverZoneClass: "h-10 w-10 sm:h-11 sm:w-11",
    titleTextClass: "text-[10px] sm:text-xs",
    descTextClass: "text-[8px] sm:text-[9px]",
    descLineClamp: "line-clamp-1",
    overlayPadding: "px-2",
  },
  regular: {
    heightClass: "h-24",
    iconSize: 34,
    iconClass: "",
    symbolCount: 13,
    hoverZoneClass: "h-16 w-16",
    titleTextClass: "text-sm sm:text-base",
    descTextClass: "text-[11px] sm:text-xs",
    descLineClamp: "line-clamp-2",
    overlayPadding: "px-4",
  },
  small: {
    heightClass: "h-14",
    iconSize: 22,
    iconClass: "",
    symbolCount: 7,
    hoverZoneClass: "h-10 w-10",
    titleTextClass: "text-[10px]",
    descTextClass: "text-[8px]",
    descLineClamp: "line-clamp-1",
    overlayPadding: "px-2",
  },
};

type DecoratedIconHeaderProps = {
  colorHex: string;
  /** Precomputed light/dark contrast decision for this color (see lib/category-palette.ts) — used for the hover title/description text, which sits directly on colorHex with no intervening pill. */
  textVariant: "white" | "dark";
  Icon: LucideIcon;
  seed: string;
  /** Item title, shown full-header on hover of the icon zone only. */
  title: string;
  /** Short description shown below the title, same hover reveal. */
  description: string;
  size?: DecoratedIconHeaderSize;
};

export default function DecoratedIconHeader({ colorHex, textVariant, Icon, seed, title, description, size = "regular" }: DecoratedIconHeaderProps) {
  const cfg = SIZE_CONFIG[size];
  const rng = mulberry32(hashSeed(seed));
  const symbols = shuffle(SYMBOL_POOL, rng).slice(0, cfg.symbolCount);
  const textColorClass = textVariant === "white" ? "text-white" : "text-[#1c1917]";

  return (
    <div className={`relative flex ${cfg.heightClass} items-center justify-center overflow-hidden`} style={{ backgroundColor: colorHex }}>
      {/* Icon hover hitbox — stays small and centered; hovering it is what triggers the reveal below. */}
      <div className={`peer group relative z-10 flex items-center justify-center ${cfg.hoverZoneClass}`}>
        <Icon size={cfg.iconSize} strokeWidth={2.5} className={`${ICON_COLOR_CLASS} ${cfg.iconClass} transition-opacity duration-300 group-hover:opacity-0`} />
      </div>

      <span
        className="pointer-events-none absolute inset-0 select-none transition-opacity duration-300 peer-hover:opacity-0"
        aria-hidden="true"
      >
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

      {/* Full-header reveal — fills the entire colored block, text sits directly on colorHex. */}
      <div
        className={`pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-0.5 ${cfg.overlayPadding} text-center opacity-0 transition-opacity duration-300 peer-hover:opacity-100 ${textColorClass}`}
      >
        <span className={`line-clamp-2 font-bold leading-tight ${cfg.titleTextClass}`}>{title}</span>
        <span className={`${cfg.descLineClamp} leading-snug opacity-90 ${cfg.descTextClass}`}>{description}</span>
      </div>
    </div>
  );
}
