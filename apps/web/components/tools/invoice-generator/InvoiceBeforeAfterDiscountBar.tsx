type InvoiceBeforeAfterDiscountBarProps = {
  beforeLabel: string;
  afterLabel: string;
  beforeValue: number;
  afterValue: number;
  beforeFormatted: string;
  afterFormatted: string;
  caption: string;
};

/** Plain HTML horizontal bars — two independent rows, not bordered boxes linked by arrows. */
export default function InvoiceBeforeAfterDiscountBar({
  beforeLabel,
  afterLabel,
  beforeValue,
  afterValue,
  beforeFormatted,
  afterFormatted,
  caption,
}: InvoiceBeforeAfterDiscountBarProps) {
  const max = Math.max(beforeValue, afterValue, 0.01);
  const rows = [
    { key: "before", label: beforeLabel, value: beforeValue, formatted: beforeFormatted, colorClass: "bg-zinc-400 dark:bg-zinc-600" },
    { key: "after", label: afterLabel, value: afterValue, formatted: afterFormatted, colorClass: "bg-blue-600 dark:bg-blue-400" },
  ];

  return (
    <figure className="my-2">
      <div dir="ltr" className="space-y-2.5" role="img" aria-label={caption}>
        {rows.map((row) => (
          <div key={row.key} className="text-sm">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-zinc-600 dark:text-zinc-300">{row.label}</span>
              <span className="shrink-0 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">{row.formatted}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className={`h-3 rounded-full ${row.colorClass}`} style={{ width: `${Math.max((row.value / max) * 100, 4)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
