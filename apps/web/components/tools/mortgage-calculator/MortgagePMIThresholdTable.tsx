type ThresholdRow = {
  label: string;
  threshold: string;
  note: string;
};

export default function MortgagePMIThresholdTable({ rows }: { rows: ThresholdRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`bg-white px-5 py-4 dark:bg-zinc-900 ${
            index !== 0 ? "border-t border-zinc-200 dark:border-zinc-800" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.label}</span>
            <span dir="ltr" className="shrink-0 font-mono text-sm text-zinc-500 dark:text-zinc-400">
              {row.threshold}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{row.note}</p>
        </div>
      ))}
    </div>
  );
}
