type MethodBar = { key: string; label: string; value: number; colorClass: string };

type InventoryThreeMethodCompareBarProps = {
  bars: MethodBar[];
  title: string;
};

/** Plain HTML horizontal bars — label above a full-width track, value at the track's end. */
export default function InventoryThreeMethodCompareBar({ bars, title }: InventoryThreeMethodCompareBarProps) {
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div dir="ltr" className="space-y-2.5" role="img" aria-label={title}>
      {bars.map((b) => (
        <div key={b.key} className="text-sm">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-zinc-600 dark:text-zinc-300">{b.label}</span>
            <span className="shrink-0 font-mono text-xs font-bold text-violet-700 dark:text-violet-300">${b.value}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className={`h-3 rounded-full ${b.colorClass}`} style={{ width: `${Math.max((b.value / max) * 100, 4)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
