"use client";
import type { ReactNode } from "react";
import "./glass-tokens.css";
import { glassInter } from "./glass-font";

/**
 * Shared "glass" visual language for the fraction-calculator hero/indicator cards. Every color
 * here is a CSS variable from glass-tokens.css (itself derived from Tailwind's own generated
 * --color-* tokens plus the math section color, §34) -- this file contains zero literal colors.
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

export function GlassPage({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${glassInter.variable} rounded-3xl p-4 sm:p-6`}
      style={{ background: "color-mix(in oklab, var(--glass-accent-1-soft) 60%, var(--color-white) 40%)", fontFamily: "var(--glass-font)" }}
    >
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

function NumberBadge({ n, accent }: { n: number; accent: AccentKey }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm"
      style={{ background: accentVar(accent, "-oncolor"), color: "var(--color-white)" }}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

export function GlassHeroCard({ n = 1, accent = "blue", title, subtitle, children }: { n?: number; accent?: AccentKey; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section
      data-hero-card={n}
      className="rounded-2xl p-4 shadow-[0_8px_30px_-12px_rgba(60,70,160,0.25)] backdrop-blur-sm sm:p-6"
      style={{ background: "var(--glass-surface)", border: "1px solid var(--glass-border)", boxShadow: `0 0 0 1px color-mix(in oklab, ${accentVar(accent)} 30%, transparent)` }}
    >
      <div className="flex items-start gap-3">
        <NumberBadge n={n} accent={accent} />
        <div className="min-w-0">
          <h3 className="text-base font-bold sm:text-lg" style={{ color: "var(--glass-title)" }}>
            {title}
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm" style={{ color: "var(--glass-subtitle)" }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function GlassIndicatorCard({ n, accent = "blue", title, subtitle, visual, table, tableTitle = "Worked Example" }: { n: number; accent?: AccentKey; title: string; subtitle: string; visual: ReactNode; table: ReactNode; tableTitle?: string }) {
  return (
    <section
      data-indicator-card={n}
      className="flex h-full flex-col rounded-2xl p-4 shadow-[0_6px_24px_-14px_rgba(60,70,160,0.25)] backdrop-blur-sm sm:p-5"
      style={{ background: "var(--glass-surface)", border: "1px solid var(--glass-border)" }}
    >
      <div className="flex items-start gap-2.5">
        <NumberBadge n={n} accent={accent} />
        <div className="min-w-0">
          <h3 className="text-sm font-bold" style={{ color: "var(--glass-title)" }}>
            {title}
          </h3>
          <p className="mt-0.5 text-[11px] leading-snug" style={{ color: "var(--glass-subtitle)" }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-4 lg:flex-row lg:items-start">
        <div dir="ltr" data-indicator-visual className="flex w-full shrink-0 items-center justify-center lg:w-auto">
          {visual}
        </div>
        <div className="w-full min-w-0 flex-1">
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
    </section>
  );
}

export function GlassIndicatorGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>;
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
