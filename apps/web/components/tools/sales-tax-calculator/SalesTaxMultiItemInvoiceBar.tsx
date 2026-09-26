type LineItem = { key: string; label: string; amount: number };

type SalesTaxMultiItemInvoiceBarProps = {
  items: LineItem[];
  taxAmount: number;
  taxLabel: string;
  totalLabel: string;
};

const COLORS = ["bg-rose-400 dark:bg-rose-400/80", "bg-rose-500 dark:bg-rose-400", "bg-rose-600 dark:bg-rose-300"];

/** Plain HTML stacked bar (CSS heights) — no SVG. */
export default function SalesTaxMultiItemInvoiceBar({ items, taxAmount, taxLabel, totalLabel }: SalesTaxMultiItemInvoiceBarProps) {
  const total = items.reduce((s, i) => s + i.amount, 0) + taxAmount;
  const segments = [
    ...items.map((item, i) => ({ key: item.key, label: item.label, amount: item.amount, colorClass: COLORS[i % COLORS.length] })),
    { key: "tax", label: taxLabel, amount: taxAmount, colorClass: "bg-amber-500 dark:bg-amber-400" },
  ];

  return (
    <div dir="ltr" className="flex flex-col items-center">
      <span className="mb-2 text-sm font-bold text-rose-700 dark:text-rose-300">
        {totalLabel}: ${total.toFixed(2)}
      </span>
      <div className="flex w-24 flex-col overflow-hidden rounded-xl" style={{ height: 160 }}>
        {segments.map((seg) => (
          <div key={seg.key} className={`flex items-center justify-center ${seg.colorClass}`} style={{ height: `${(seg.amount / total) * 100}%` }} />
        ))}
      </div>
      <div className="mt-3 space-y-1 text-xs">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${seg.colorClass}`} />
            <span className="text-zinc-600 dark:text-zinc-300">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
