type Bar = { key: string; label: string; value: number; formatted: string };

type SalesTaxWorkedExamplesBarProps = {
  bars: Bar[];
};

/**
 * Plain HTML horizontal bars — label above, full-width track below, value
 * at the track's end. A fixed-width label column with `truncate` was tried
 * first and cut a real label ("$108 total @ 8% (reverse)") down to
 * "$108 total @ 8…" — losing real information, not just a cosmetic
 * squeeze. Stacking the label on its own line removes the width
 * constraint entirely; it wraps normally like any other text instead.
 * `dir="ltr"` matches every quantitative chart in this codebase.
 */
export default function SalesTaxWorkedExamplesBar({ bars }: SalesTaxWorkedExamplesBarProps) {
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div dir="ltr" className="space-y-3">
      {bars.map((b) => (
        <div key={b.key} className="text-sm">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-zinc-600 dark:text-zinc-300">{b.label}</span>
            <span className="shrink-0 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">{b.formatted}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-3 rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${Math.max((b.value / max) * 100, 4)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
