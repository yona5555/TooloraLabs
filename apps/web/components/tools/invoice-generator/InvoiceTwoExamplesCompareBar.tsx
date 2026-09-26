type ExampleBar = { key: string; label: string; taxable: number; tax: number };

type InvoiceTwoExamplesCompareBarProps = {
  examples: ExampleBar[];
  title: string;
  taxLabel: string;
};

/** Plain HTML stacked bars — each bar is one continuous two-segment fill, not bordered boxes linked by arrows. */
export default function InvoiceTwoExamplesCompareBar({ examples, title, taxLabel }: InvoiceTwoExamplesCompareBarProps) {
  const max = Math.max(...examples.map((e) => e.taxable + e.tax), 1);

  return (
    <div dir="ltr" className="space-y-3" role="img" aria-label={title}>
      {examples.map((ex) => {
        const total = ex.taxable + ex.tax;
        const taxablePct = (ex.taxable / max) * 100;
        const taxPct = (ex.tax / max) * 100;
        return (
          <div key={ex.key} className="text-sm">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-zinc-600 dark:text-zinc-300">{ex.label}</span>
              <span className="shrink-0 font-mono text-xs font-bold text-violet-700 dark:text-violet-300">${total.toFixed(2)}</span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-3 bg-violet-500 dark:bg-violet-400" style={{ width: `${taxablePct}%` }} />
              <div className="h-3 bg-violet-300 dark:bg-violet-600" style={{ width: `${taxPct}%` }} />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">{taxLabel}</p>
    </div>
  );
}
