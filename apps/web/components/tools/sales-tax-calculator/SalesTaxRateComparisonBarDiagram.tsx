type SalesTaxRateComparisonBarDiagramProps = {
  bars: { label: string; value: number; highlighted?: boolean }[];
  formatValue: (value: number) => string;
  caption: string;
};

/**
 * Plain HTML vertical bar chart — a single row of independent bars, not
 * bordered boxes linked by arrows, so it's outside the banned pattern.
 * Rebuilt fresh (not left alone) per the rm-all-indicators pass. Value and
 * axis labels sit above/below each bar at a fixed width rather than inside
 * a fill, so a long formatted value never crowds a narrow bar.
 */
export default function SalesTaxRateComparisonBarDiagram({ bars, formatValue, caption }: SalesTaxRateComparisonBarDiagramProps) {
  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex items-end justify-center gap-3 overflow-x-auto" style={{ height: 140 }}>
        {bars.map((bar) => {
          const heightPct = Math.max((bar.value / maxValue) * 100, 4);
          return (
            <div key={bar.label} className="flex w-12 shrink-0 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200">{formatValue(bar.value)}</span>
              <div
                className={`w-8 rounded-t-md ${bar.highlighted ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-300 dark:bg-zinc-600"}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{bar.label}</span>
            </div>
          );
        })}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
