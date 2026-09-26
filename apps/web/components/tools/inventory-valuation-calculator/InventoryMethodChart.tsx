type InventoryMethodChartProps = {
  fifo: number;
  lifo: number;
  weightedAverage: number;
  fifoLabel: string;
  lifoLabel: string;
  weightedAverageLabel: string;
  chartLabel: string;
  formatValue: (value: number) => string;
};

/** Plain HTML horizontal bars — label above a full-width track, value at the track's end. */
export default function InventoryMethodChart({
  fifo,
  lifo,
  weightedAverage,
  fifoLabel,
  lifoLabel,
  weightedAverageLabel,
  chartLabel,
  formatValue,
}: InventoryMethodChartProps) {
  const rows = [
    { key: "fifo", label: fifoLabel, value: fifo },
    { key: "lifo", label: lifoLabel, value: lifo },
    { key: "wavg", label: weightedAverageLabel, value: weightedAverage },
  ];
  const max = Math.max(fifo, lifo, weightedAverage, 1);

  return (
    <div dir="ltr" className="space-y-2.5" role="img" aria-label={chartLabel}>
      {rows.map((row) => (
        <div key={row.key} className="text-sm">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-zinc-600 dark:text-zinc-300">{row.label}</span>
            <span className="shrink-0 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatValue(row.value)}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-3 rounded-full bg-blue-600 dark:bg-blue-400" style={{ width: `${Math.max((row.value / max) * 100, 4)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
