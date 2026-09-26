type LineItemBox = { key: string; label: string; qty: number; unitPrice: number };

type InvoiceLineItemQtyPriceDiagramProps = {
  items: LineItemBox[];
  title: string;
};

/** Plain HTML rows — an independent list of line items, not bordered boxes linked by arrows. */
export default function InvoiceLineItemQtyPriceDiagram({ items, title }: InvoiceLineItemQtyPriceDiagramProps) {
  return (
    <div className="space-y-2" role="img" aria-label={title}>
      {items.map((item) => {
        const lineTotal = item.qty * item.unitPrice;
        return (
          <div key={item.key} className="flex items-center justify-between gap-3 rounded-xl bg-teal-50 px-4 py-3 dark:bg-teal-500/10">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-teal-800 dark:text-teal-200">{item.label}</p>
              <p dir="ltr" className="text-xs text-teal-600 dark:text-teal-400">
                {item.qty} × ${item.unitPrice.toFixed(2)}
              </p>
            </div>
            <span dir="ltr" className="shrink-0 font-mono text-base font-bold text-teal-700 dark:text-teal-300">
              ${lineTotal.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
