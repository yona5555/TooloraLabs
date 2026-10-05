"use client";
import type { ReactNode } from "react";

/**
 * Shared "glass" visual language for the batch1 redesign (fraction-calculator,
 * scientific-notation-converter, significant-figures-calculator, statistics-calculator,
 * area-calculator): light lavender ground, white translucent cards, numbered badges,
 * worked-example tables that sit beside the visual (§32), colored accent gradients.
 * Reused across all 5 tools rather than rebuilt per tool.
 */

export const ACCENT = {
  blue: { grad: "from-[#5B6EF5] to-[#7C8CF8]", text: "text-[#4552D6]", bg: "bg-[#EEF0FE]", ring: "ring-[#5B6EF5]/30", dot: "bg-[#5B6EF5]" },
  pink: { grad: "from-[#F0507A] to-[#F97BA0]", text: "text-[#C73862]", bg: "bg-[#FDEEF2]", ring: "ring-[#F0507A]/30", dot: "bg-[#F0507A]" },
  mint: { grad: "from-[#1FC89C] to-[#4FE0BB]", text: "text-[#0E9777]", bg: "bg-[#E9FBF6]", ring: "ring-[#1FC89C]/30", dot: "bg-[#1FC89C]" },
  cyan: { grad: "from-[#2FB6E0] to-[#6AD2F2]", text: "text-[#1480A3]", bg: "bg-[#EAF8FD]", ring: "ring-[#2FB6E0]/30", dot: "bg-[#2FB6E0]" },
  purple: { grad: "from-[#8B5CF6] to-[#C084FC]", text: "text-[#6D28D9]", bg: "bg-[#F4EEFE]", ring: "ring-[#8B5CF6]/30", dot: "bg-[#8B5CF6]" },
} as const;
export type AccentKey = keyof typeof ACCENT;

export function GlassPage({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-3xl p-4 sm:p-6"
      style={{ background: "linear-gradient(180deg, #EEF1FA 0%, #E9EDFA 100%)" }}
    >
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

function NumberBadge({ n, accent }: { n: number; accent: AccentKey }) {
  const a = ACCENT[accent];
  return (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${a.grad} text-xs font-bold text-white shadow-sm`}>
      {String(n).padStart(2, "0")}
    </span>
  );
}

export function GlassHeroCard({ n = 1, accent = "blue", title, subtitle, children }: { n?: number; accent?: AccentKey; title: string; subtitle: string; children: ReactNode }) {
  const a = ACCENT[accent];
  return (
    <section data-hero-card={n} className={`rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_8px_30px_-12px_rgba(60,70,160,0.25)] backdrop-blur-sm sm:p-6 ring-1 ${a.ring}`}>
      <div className="flex items-start gap-3">
        <NumberBadge n={n} accent={accent} />
        <div className="min-w-0">
          <h3 className="font-[Inter,ui-sans-serif] text-base font-bold text-zinc-800 dark:text-zinc-100 sm:text-lg">{title}</h3>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function GlassIndicatorCard({ n, accent = "blue", title, subtitle, visual, table, tableTitle = "Worked Example" }: { n: number; accent?: AccentKey; title: string; subtitle: string; visual: ReactNode; table: ReactNode; tableTitle?: string }) {
  const a = ACCENT[accent];
  return (
    <section data-indicator-card={n} className="flex h-full flex-col rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_6px_24px_-14px_rgba(60,70,160,0.25)] backdrop-blur-sm sm:p-5">
      <div className="flex items-start gap-2.5">
        <NumberBadge n={n} accent={accent} />
        <div className="min-w-0">
          <h3 className="font-[Inter,ui-sans-serif] text-sm font-bold text-zinc-800 dark:text-zinc-100">{title}</h3>
          <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
        <div dir="ltr" data-indicator-visual className="flex w-full shrink-0 items-center justify-center lg:w-auto">
          {visual}
        </div>
        <div className="w-full min-w-0 flex-1">
          <div className="rounded-xl bg-zinc-50/80 p-3 dark:bg-zinc-800/40">
            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">{tableTitle}</p>
            <div data-indicator-table className="mt-1.5">{table}</div>
          </div>
        </div>
      </div>
      <div className={`mt-3 rounded-lg ${a.bg} px-2.5 py-1.5 text-center text-[10px] font-semibold ${a.text}`}>LIVE · recomputes while you drag</div>
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
          <tr className="border-b border-zinc-200 dark:border-zinc-700">
            {columns.map((c) => (
              <th key={c.key} className="px-2 py-1.5 text-start font-semibold text-zinc-500 dark:text-zinc-400">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
              {columns.map((c) => (
                <td key={c.key} dir="ltr" className="px-2 py-1.5 text-end font-mono text-zinc-700 first:text-start dark:text-zinc-200">
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
