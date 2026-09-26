import type { ReactNode } from "react";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

type Props = {
  /** The chart/diagram/gauge itself. */
  indicator: ReactNode;
  /** Heading text above the WORKED EXAMPLE row list ("Worked Example" in the active locale). */
  workedExampleTitle: string;
  rows: Row[];
  /** Set when `indicator` already manages its own dir="ltr" internally (e.g. a gauge with numeric ticks) — leaves the wrapper's own direction alone either way, since this component never forces one. */
  className?: string;
};

/**
 * Site-wide reference layout for "one indicator + its own WORKED EXAMPLE
 * table," structurally enforced side by side (never stacked, never the
 * table floating below with a gap) — `shrink-0` on the indicator, `flex-1`
 * on the table, both centered on one flex row that only wraps to a column
 * on truly narrow viewports (`lg:flex-row`).
 *
 * Deliberately carries no `dir="ltr"` of its own. Break-Even's own
 * BreakEvenBusinessTypeDiagram (the literal reference for any indicator
 * comparing two or more real options — cost structures, FIFO vs LIFO,
 * quote vs invoice) is plain HTML with no forced direction at all, and
 * that is exactly why it already reads correctly on an RTL page with zero
 * extra logic: a plain HTML flex/grid row naturally reverses its visual
 * order under `dir="rtl"` the same way any other paragraph would. Forcing
 * `dir="ltr"` on a *conceptual* comparison (which option is "first," which
 * card sits where) is what silently pins it to LTR ordering even inside
 * an Arabic page — that bug class is why this wrapper never adds one.
 * A caller whose indicator is itself numeric/directional (a gauge with
 * percentage ticks, a currency ribbon) keeps `dir="ltr"` scoped to just
 * that inner element, exactly as RatioGauge and the *FormulaDiagram
 * ribbons already do — never on this outer wrapper.
 */
export default function IndicatorWithTable({ indicator, workedExampleTitle, rows, className = "" }: Props) {
  return (
    <div className={`flex flex-col gap-6 lg:flex-row lg:items-center ${className}`}>
      <div className="min-w-0 shrink-0">{indicator}</div>
      <div className="min-w-[200px] flex-1 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
        <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{workedExampleTitle}</p>
        <dl className="mt-3 space-y-2 text-sm">
          {rows.map((row, i) => (
            <div key={i}>
              <div className={`flex items-baseline justify-between gap-3 ${row.emphasize ? "border-t border-zinc-200 pt-2 dark:border-zinc-700" : ""}`}>
                <dt className="text-zinc-500 dark:text-zinc-400">{row.label}</dt>
                <dd dir="ltr" className={`font-mono font-semibold ${row.emphasize ? "text-base text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}>
                  {row.value}
                </dd>
              </div>
              {row.note && <p className="text-end text-xs text-zinc-400 dark:text-zinc-500">{row.note}</p>}
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
