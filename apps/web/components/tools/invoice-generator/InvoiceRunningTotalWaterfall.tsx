type InvoiceRunningTotalWaterfallProps = {
  stages: { label: string; value: number }[];
  formatValue: (value: number) => string;
  caption: string;
};

/** Plain HTML horizontal bars — label above a full-width track, value at the track's end; the final (Total) stage is emphasized. */
export default function InvoiceRunningTotalWaterfall({ stages, formatValue, caption }: InvoiceRunningTotalWaterfallProps) {
  const max = Math.max(...stages.map((s) => s.value), 0.01);

  return (
    <figure className="my-2">
      <div dir="ltr" className="space-y-2.5" role="img" aria-label={caption}>
        {stages.map((stage, i) => {
          const isLast = i === stages.length - 1;
          return (
            <div key={i} className="text-sm">
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className={isLast ? "font-semibold text-zinc-800 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-300"}>{stage.label}</span>
                <span className={`shrink-0 font-mono text-xs font-bold ${isLast ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"}`}>{formatValue(stage.value)}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-3 rounded-full ${isLast ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-400 dark:bg-zinc-600"}`}
                  style={{ width: `${Math.max((stage.value / max) * 100, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
