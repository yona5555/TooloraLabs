"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import SectionCard from "@/components/tool-ui/SectionCard";
import "./glass-tokens.css";
import { glassInter } from "./glass-font";

/**
 * Shared "glass" visual language for the fraction-calculator hero/indicator cards. Every color
 * here is a CSS variable from glass-tokens.css (itself derived from Tailwind's own generated
 * --color-* tokens plus the math section color, §34) -- this file contains zero literal colors.
 * Card chrome is the site's own shared SectionCard (solid brand-blue header band) per §37 --
 * reused as-is, never reinvented; only the body content below it uses the token-driven accent
 * system, kept semantic (A vs B vs result), never as a rotating per-card header color.
 */

export const ACCENT = {
  blue: { n: 1 },
  pink: { n: 2 },
  mint: { n: 3 },
  cyan: { n: 4 },
  purple: { n: 5 },
} as const;
export type AccentKey = keyof typeof ACCENT;

function accentVar(accent: AccentKey, suffix: "" | "-strong" | "-soft" | "-oncolor" = ""): string {
  return `var(--glass-accent-${ACCENT[accent].n}${suffix})`;
}

/** Card-height rhythm (§37): three weights so the page isn't 15 identical boxes. Explicit per
 * card so no two adjacent cards share a weight and no two "feature" cards sit next to each
 * other -- verified by hand, re-check both constraints before changing this table. */
export type CardWeight = "feature" | "standard" | "compact";
const WEIGHT_BY_CARD: Record<number, CardWeight> = {
  2: "standard",
  3: "compact",
  4: "standard",
  5: "feature",
  6: "compact",
  7: "feature",
  8: "standard",
  9: "compact",
  10: "standard",
  11: "compact",
  12: "feature",
  13: "standard",
  14: "compact",
  15: "standard",
  16: "feature",
};
const WEIGHT_LAYOUT: Record<CardWeight, { visual: string; table: string; minH: string }> = {
  feature: { visual: "lg:basis-[62%]", table: "lg:basis-[38%]", minH: "min-h-[180px]" },
  standard: { visual: "lg:basis-1/2", table: "lg:basis-1/2", minH: "min-h-[130px]" },
  compact: { visual: "lg:basis-[40%]", table: "lg:basis-[55%]", minH: "min-h-[100px]" },
};

/** Zigzag (§37): odd card numbers show the visual first (left on LTR), even numbers show the
 * table first -- alternating every row on desktop; mobile always stacks visual-first regardless. */
function sideFor(n: number): "visual-left" | "table-left" {
  return n % 2 === 1 ? "visual-left" : "table-left";
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
/** useSyncExternalStore -- not useState+useEffect -- is the hydration-safe, lint-clean way to
 * read a browser media query: the server snapshot is always false, so SSR and first client
 * render always agree (no mismatch), and React itself (not an effect body) handles reconciling
 * the real value right after. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION_QUERY).matches, () => false);
}

/** §42.3: flashes `true` for ~600ms every time `trigger()` is called, then auto-clears -- the
 * hook a card's own control uses to tint its changed table cells once per interaction. Reduced
 * motion still flags the change (callers add the animated class only when motion is allowed) so
 * the "did this change" signal never fully disappears, it just stops animating. */
export function useValueFlash(durationMs = 600) {
  const [flashing, setFlashing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function trigger() {
    setFlashing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlashing(false), durationMs);
  }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return { flashing, trigger };
}

/** Always starts false so server and client render identically (no hydration mismatch); setState
 * is only ever called from inside the IntersectionObserver's own async callback -- never
 * synchronously in the effect body. Reduced motion is handled in CSS (Reveal's
 * motion-reduce:transition-none below), not by special-casing this hook: an in-viewport element's
 * observer callback fires within a frame of mount either way, so reduced-motion users still see it
 * revealed almost immediately, just without the eased animation. */
function useRevealed<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, revealed };
}

/** Plays once as each card enters the viewport: opacity + a small translate only, never a change
 * to the element's own box size (zero layout shift). Reduced-motion and a missing
 * IntersectionObserver both resolve to "already revealed" so content is never stuck hidden. The
 * print override is a belt-and-suspenders safety net -- browser print already shows a completely
 * separate [data-print-area] subtree (globals.css), these cards aren't in it either way. */
function Reveal({ children, "data-testid": testId }: { children: ReactNode; "data-testid"?: string }) {
  const { ref, revealed: observed } = useRevealed<HTMLDivElement>();
  const reducedMotion = usePrefersReducedMotion();
  const revealed = observed || reducedMotion;
  return (
    <div
      ref={ref}
      data-revealed={revealed}
      data-testid={testId}
      className="print:opacity-100! print:translate-y-0!"
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(12px)",
        transition: reducedMotion ? "none" : "opacity 0.5s ease-out, transform 0.5s ease-out",
        fontFamily: "var(--glass-font)",
      }}
    >
      {children}
    </div>
  );
}

/** Defines --glass-font-inter once at the top of the page (next/font's generated variable class)
 * so every card below -- however deeply it's nested inside the scattered article content --
 * resolves var(--glass-font) correctly, without needing its own font loader. Imposes no layout
 * of its own (callers nest this around whatever structure, cards and article text alike). */
export function GlassPage({ children }: { children: ReactNode }) {
  return <div className={glassInter.variable}>{children}</div>;
}

function NumberBadge({ n }: { n: number }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ background: "color-mix(in oklab, var(--color-white) 20%, transparent)", border: "1px solid color-mix(in oklab, var(--color-white) 38%, transparent)", color: "var(--color-white)" }}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

function CardTitle({ n, title }: { n: number; title: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <NumberBadge n={n} />
      {title}
    </span>
  );
}

export function GlassHeroCard({
  n = 1,
  title,
  subtitle,
  children,
  compact = false,
}: {
  n?: number;
  accent?: AccentKey;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Tighter body padding for a card that has to fit a height budget it doesn't control (e.g. a
   * sidebar column capped by a sibling it can't resize, §41) -- defaults to false, so every
   * existing caller's padding is unchanged. */
  compact?: boolean;
}) {
  return (
    <Reveal data-testid={`reveal-${n}`}>
      <SectionCard title={<CardTitle n={n} title={title} />} id={`card-${n}`} bodyClassName={compact ? "p-3" : "p-4 lg:p-6"}>
        <div data-hero-card={n}>
          {subtitle && (
            <p className="text-xs sm:text-sm" style={{ color: "var(--glass-subtitle)" }}>
              {subtitle}
            </p>
          )}
          <div className={subtitle ? "mt-4" : ""}>{children}</div>
        </div>
      </SectionCard>
    </Reveal>
  );
}

export function GlassIndicatorCard({
  n,
  accent = "blue",
  title,
  subtitle,
  visual,
  table,
  tableTitle = "Worked Example",
}: {
  n: number;
  accent?: AccentKey;
  title: string;
  subtitle: string;
  visual: ReactNode;
  table: ReactNode;
  tableTitle?: string;
}) {
  const weight = WEIGHT_BY_CARD[n] ?? "standard";
  const side = sideFor(n);
  const layout = WEIGHT_LAYOUT[weight];
  const rowDirection = side === "visual-left" ? "lg:flex-row" : "lg:flex-row-reverse";

  return (
    <Reveal data-testid={`reveal-${n}`}>
      <SectionCard title={<CardTitle n={n} title={title} />} id={`card-${n}`} bodyClassName="p-4 lg:p-6">
        <div data-indicator-card={n} data-card-weight={weight} data-card-side={side}>
          <p className="text-[11px] leading-snug sm:text-xs" style={{ color: "var(--glass-subtitle)" }}>
            {subtitle}
          </p>
          <div className={`mt-3 flex flex-col gap-4 lg:items-start ${rowDirection}`}>
            <div dir="ltr" data-indicator-visual className={`flex w-full items-center justify-center ${layout.visual} ${layout.minH}`}>
              {visual}
            </div>
            <div className={`flex w-full min-w-0 flex-col ${layout.table}`}>
              <div className="h-full rounded-xl p-3" style={{ background: "var(--glass-table-wrap-bg)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--glass-muted)" }}>
                  {tableTitle}
                </p>
                <div data-indicator-table className="mt-1.5">
                  {table}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-lg px-2.5 py-1.5 text-center text-[10px] font-semibold" style={{ background: accentVar(accent, "-soft"), color: accentVar(accent, "-strong") }}>
            LIVE · recomputes while you drag
          </div>
        </div>
      </SectionCard>
    </Reveal>
  );
}

export function GlassIndicatorGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-5">{children}</div>;
}

// A plain `Record<string, string> & {isKeyResult?: boolean}` fails to typecheck: TS applies the
// index signature to every property access by string key, including the named ones, so a
// boolean-valued `isKeyResult` conflicts with it. Widening the index signature's value type is
// the straightforward fix; `columns.map(...)` below still only ever reads the string-valued
// column cells, `rowKey`/`isKeyResult` are read through their own named access.
export type TableRow = Record<string, string | boolean | undefined> & { rowKey?: string; isKeyResult?: boolean };
export function GlassTable({
  columns,
  rows,
  flashing = false,
  activeRowKey,
  onRowHover,
}: {
  columns: { key: string; label: string }[];
  rows: TableRow[];
  /** §42.3: true for ~600ms right after a card's own control changes a value -- tints every
   * data cell once per interaction (reduced-motion users still get the tint, just unanimated). */
  flashing?: boolean;
  /** §42.4: the row whose `rowKey` currently matches the hovered/focused part of this card's own
   * visual (or vice-versa) -- highlights that row. Scoped to this one card, never cross-card. */
  activeRowKey?: string | null;
  onRowHover?: (rowKey: string | null) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[220px] border-collapse text-xs">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--glass-table-row-border)" }}>
            {columns.map((c) => (
              <th key={c.key} className="px-2 py-1.5 text-start text-[13px] font-bold" style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-table-header-text)" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isKeyRow = r.isKeyResult ?? false;
            const isActive = !!r.rowKey && r.rowKey === activeRowKey;
            return (
              <tr
                key={i}
                data-key={r.rowKey}
                onPointerEnter={r.rowKey && onRowHover ? () => onRowHover(r.rowKey!) : undefined}
                onPointerLeave={r.rowKey && onRowHover ? () => onRowHover(null) : undefined}
                onFocus={r.rowKey && onRowHover ? () => onRowHover(r.rowKey!) : undefined}
                onBlur={r.rowKey && onRowHover ? () => onRowHover(null) : undefined}
                className={flashing ? "glass-value-flash" : undefined}
                style={{
                  borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--glass-table-row-border)",
                  background: isKeyRow ? "var(--glass-key-row-bg)" : isActive ? "var(--glass-table-header-bg)" : undefined,
                  fontWeight: isKeyRow ? 700 : 400,
                }}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    dir="ltr"
                    className="px-2 py-1.5 text-end font-mono tabular-nums first:text-start"
                    style={{ color: isKeyRow ? "var(--glass-key-row-text)" : "var(--glass-table-text)" }}
                  >
                    {r[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export type HandleDirection = "horizontal" | "vertical" | "circular" | "free";
const HANDLE_ICON: Record<HandleDirection, string> = {
  horizontal: "↔",
  vertical: "↕",
  circular: "↻",
  free: "✥",
};
const HANDLE_CURSOR: Record<HandleDirection, string> = {
  horizontal: "cursor-ew-resize",
  vertical: "cursor-ns-resize",
  circular: "cursor-grab",
  free: "cursor-grab",
};

/**
 * §40: the one shared drag-handle look every indicator (and the hero) renders its own control
 * with -- a direction icon, a pulsing ring until the visitor's first real press, grab/grabbing
 * cursor, a >=44x44 hit area, and arrow-key stepping at the same granularity as a drag. Purely
 * the affordance + a11y layer: the caller still owns the actual pointer-drag math and positions
 * this absolutely (via `style`) wherever its own puck belongs.
 */
export function GlassHandle({
  direction,
  ariaLabel,
  onStep,
  style,
  size = 26,
  className = "",
  valueNow = 50,
  valueMin = 0,
  valueMax = 100,
}: {
  direction: HandleDirection;
  ariaLabel: string;
  /** Called on ArrowLeft/Down (-1) and ArrowRight/Up (+1) -- the same snapped step a drag uses. */
  onStep?: (delta: 1 | -1) => void;
  style?: CSSProperties;
  size?: number;
  className?: string;
  /** role="slider" requires its own aria-valuenow (jsx-a11y/role-has-required-aria-props) -- a
   * caller that tracks a real 0-100-ish position can pass its own; otherwise this stays a
   * reasonable midpoint rather than an actually-wrong 0, since this handle's own drag math
   * (not this value) is what every caller already uses for the real position. */
  valueNow?: number;
  valueMin?: number;
  valueMax?: number;
}) {
  const [touched, setTouched] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const showPulse = !touched && !reducedMotion;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!onStep) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      onStep(1);
      e.preventDefault();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      onStep(-1);
      e.preventDefault();
    }
  }

  return (
    <div
      role="slider"
      aria-label={ariaLabel}
      aria-valuenow={valueNow}
      aria-valuemin={valueMin}
      aria-valuemax={valueMax}
      tabIndex={0}
      data-role="handle"
      onPointerDown={() => setTouched(true)}
      onKeyDown={handleKeyDown}
      className={`absolute flex touch-none items-center justify-center rounded-full select-none ${HANDLE_CURSOR[direction]} active:cursor-grabbing ${className}`}
      style={{ width: 44, height: 44, ...style }}
    >
      {showPulse && (
        <span
          aria-hidden="true"
          className="glass-handle-pulse-ring absolute rounded-full"
          style={{ width: size, height: size, background: "var(--glass-handle-ring)" }}
        />
      )}
      <span
        aria-hidden="true"
        className="relative flex items-center justify-center rounded-full text-xs font-bold leading-none shadow-sm"
        style={{ width: size, height: size, background: "var(--glass-handle-bg)", color: "var(--glass-handle-icon)", border: "1.5px solid var(--glass-handle-border)" }}
      >
        {HANDLE_ICON[direction]}
      </span>
    </div>
  );
}
