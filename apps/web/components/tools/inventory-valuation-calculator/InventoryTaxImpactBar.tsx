type ImpactColumn = { key: string; label: string; cogs: number; colorClass: string };

type InventoryTaxImpactBarProps = {
  columns: ImpactColumn[];
  cogsLabel: string;
  title: string;
};

/** Plain HTML vertical bar chart — independent columns, not bordered boxes linked by arrows. */
export default function InventoryTaxImpactBar({ columns, cogsLabel, title }: InventoryTaxImpactBarProps) {
  const max = Math.max(...columns.map((c) => c.cogs), 1);

  return (
    <div>
      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">{cogsLabel}</p>
      <div dir="ltr" className="mt-2 flex items-end justify-center gap-6" style={{ height: 120 }} role="img" aria-label={title}>
        {columns.map((col) => {
          const heightPct = Math.max((col.cogs / max) * 100, 4);
          return (
            <div key={col.key} className="flex w-16 shrink-0 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">${col.cogs}</span>
              <div className={`w-10 rounded-t-md ${col.colorClass}`} style={{ height: `${heightPct}%` }} />
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{col.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
