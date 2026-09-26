type LineItem = { key: string; label: string; amount: number };

type InvoiceExampleLineBreakdownBarProps = {
  items: LineItem[];
  taxAmount: number;
  taxLabel: string;
  totalLabel: string;
};

const COLORS = ["bg-emerald-400 dark:bg-emerald-400/80", "bg-emerald-600 dark:bg-emerald-300"];

/**
 * Plain HTML stacked bar — one continuous multi-segment fill, not bordered
 * boxes linked by arrows. Segment labels never render inside the fill (a
 * short segment could be only a few pixels wide); they live in the legend
 * row below instead.
 */
export default function InvoiceExampleLineBreakdownBar({ items, taxAmount, taxLabel, totalLabel }: InvoiceExampleLineBreakdownBarProps) {
  const total = items.reduce((s, i) => s + i.amount, 0) + taxAmount;
  const segments = [
    ...items.map((item, i) => ({ key: item.key, label: item.label, amount: item.amount, colorClass: COLORS[i % COLORS.length] })),
    { key: "tax", label: taxLabel, amount: taxAmount, colorClass: "bg-amber-500 dark:bg-amber-400" },
  ];

  return (
    <div dir="ltr">
      <p className="text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
        {totalLabel}: ${total.toFixed(2)}
      </p>
      <div className="mt-2 flex h-8 w-full overflow-hidden rounded-lg">
        {segments.map((seg) => (
          <div key={seg.key} className={seg.colorClass} style={{ width: `${(seg.amount / total) * 100}%` }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
        {segments.map((seg) => (
          <span key={seg.key} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${seg.colorClass}`} />
            <span className="text-zinc-600 dark:text-zinc-300">{seg.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
