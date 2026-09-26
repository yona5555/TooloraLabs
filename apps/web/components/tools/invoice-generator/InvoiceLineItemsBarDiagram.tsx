type InvoiceLineItemsBarDiagramProps = {
  items: { label: string; value: number }[];
  formatValue: (value: number) => string;
  caption: string;
};

const MAX_ROWS = 8;

/** Plain HTML horizontal bars — label above a full-width track, value at the track's end. */
export default function InvoiceLineItemsBarDiagram({ items, formatValue, caption }: InvoiceLineItemsBarDiagramProps) {
  const rows = items.slice(0, MAX_ROWS);
  const overflow = items.length - rows.length;
  const max = Math.max(...rows.map((r) => r.value), 0.01);

  return (
    <figure className="my-2">
      <div dir="ltr" className="space-y-2.5" role="img" aria-label={caption}>
        {rows.map((row, i) => (
          <div key={i} className="text-sm">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="truncate text-zinc-600 dark:text-zinc-300">{row.label}</span>
              <span className="shrink-0 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">{formatValue(row.value)}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-3 rounded-full bg-blue-600 dark:bg-blue-400" style={{ width: `${Math.max((row.value / max) * 100, 4)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">
        {caption}
        {overflow > 0 ? ` (+${overflow})` : ""}
      </figcaption>
    </figure>
  );
}
