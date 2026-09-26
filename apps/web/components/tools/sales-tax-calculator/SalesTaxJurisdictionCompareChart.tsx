type ColumnItem = { key: string; label: string; totalCost: number };

type SalesTaxJurisdictionCompareChartProps = {
  items: ColumnItem[];
};

/** Plain HTML vertical bars (CSS height %) — no SVG, no fixed-width text. */
export default function SalesTaxJurisdictionCompareChart({ items }: SalesTaxJurisdictionCompareChartProps) {
  const min = Math.min(...items.map((i) => i.totalCost), 0);
  const max = Math.max(...items.map((i) => i.totalCost), 1);
  const range = Math.max(max - min, 1);

  return (
    <div dir="ltr" className="flex items-end justify-center gap-4" style={{ height: 160 }}>
      {items.map((item) => {
        const heightPct = 20 + ((item.totalCost - min) / range) * 80;
        return (
          <div key={item.key} className="flex flex-1 flex-col items-center gap-1" style={{ maxWidth: 72 }}>
            <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300">${item.totalCost.toFixed(2)}</span>
            <div className="flex w-full flex-1 items-end">
              <div className="w-full rounded-t-md bg-amber-500 dark:bg-amber-400" style={{ height: `${heightPct}%` }} />
            </div>
            <span className="text-center text-[10px] text-zinc-500 dark:text-zinc-400">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
