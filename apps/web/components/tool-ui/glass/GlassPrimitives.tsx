"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
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
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION_QUERY).matches, () => false);
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

export function GlassHeroCard({ n = 1, title, subtitle, children }: { n?: number; accent?: AccentKey; title: string; subtitle: string; children: ReactNode }) {
  return (
    <Reveal data-testid={`reveal-${n}`}>
      <SectionCard title={<CardTitle n={n} title={title} />} id={`card-${n}`} bodyClassName="p-4 lg:p-6">
        <div data-hero-card={n}>
          <p className="text-xs sm:text-sm" style={{ color: "var(--glass-subtitle)" }}>
            {subtitle}
          </p>
          <div className="mt-4">{children}</div>
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

export type TableRow = Record<string, string>;
export function GlassTable({ columns, rows }: { columns: { key: string; label: string }[]; rows: TableRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[220px] border-collapse text-xs">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--glass-table-row-border)" }}>
            {columns.map((c) => (
              <th key={c.key} className="px-2 py-1.5 text-start font-semibold" style={{ background: "var(--glass-table-header-bg)", color: "var(--glass-table-header-text)" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--glass-table-row-border)" }}>
              {columns.map((c) => (
                <td key={c.key} dir="ltr" className="px-2 py-1.5 text-end font-mono first:text-start" style={{ color: "var(--glass-table-text)" }}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
