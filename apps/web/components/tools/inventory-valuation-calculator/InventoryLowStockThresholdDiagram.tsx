type InventoryLowStockThresholdDiagramProps = {
  currentLabel: string;
  thresholdLabel: string;
};

const MAX_UNITS = 20;
const CURRENT_UNITS = 8;
const THRESHOLD_UNITS = 10;

/**
 * Plain HTML magnitude scale — a current-value dot against a threshold
 * marker on one continuous track, not bordered boxes linked by arrows.
 * The two markers sit close together on the track (8 vs 10 of 20), so their
 * labels live in a fixed legend row below instead of being positioned at
 * each marker's own percentage offset — that first approach let the two
 * text labels overlap and interleave into unreadable text whenever the
 * values were close. `dir="ltr"`: the track fill is a magnitude, same
 * category as every other quantitative chart in this codebase.
 */
export default function InventoryLowStockThresholdDiagram({ currentLabel, thresholdLabel }: InventoryLowStockThresholdDiagramProps) {
  const currentPct = (CURRENT_UNITS / MAX_UNITS) * 100;
  const thresholdPct = (THRESHOLD_UNITS / MAX_UNITS) * 100;

  return (
    <div dir="ltr" role="img" aria-label={`${currentLabel} (${CURRENT_UNITS}) / ${thresholdLabel} (${THRESHOLD_UNITS})`}>
      <div className="relative h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="absolute inset-y-0 start-0 rounded-full bg-rose-300 dark:bg-rose-400/50" style={{ width: `${thresholdPct}%` }} />
        <div className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-cyan-600 dark:bg-cyan-400" style={{ insetInlineStart: `${thresholdPct}%` }} />
        <div className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-cyan-500 dark:bg-cyan-400 rtl:translate-x-1/2" style={{ insetInlineStart: `${currentPct}%` }} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500 dark:bg-cyan-400" />
          <span className="text-cyan-700 dark:text-cyan-300">
            {currentLabel} ({CURRENT_UNITS})
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-0.5 shrink-0 bg-cyan-600 dark:bg-cyan-400" />
          <span className="text-cyan-700 dark:text-cyan-300">
            {thresholdLabel} ({THRESHOLD_UNITS})
          </span>
        </span>
      </div>
    </div>
  );
}
