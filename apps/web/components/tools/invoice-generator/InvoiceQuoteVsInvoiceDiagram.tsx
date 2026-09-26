type InvoiceQuoteVsInvoiceDiagramProps = {
  quoteLabel: string;
  invoiceLabel: string;
  quoteTraits: string[];
  invoiceTraits: string[];
  caption: string;
};

/**
 * Plain HTML two-column comparison cards — matches
 * BreakEvenBusinessTypeDiagram's pattern exactly. The previous version was
 * two bordered SVG rects side by side with hand-wrapped <tspan> text, the
 * same bug class Break-Even's own diagram already replaced this for.
 */
export default function InvoiceQuoteVsInvoiceDiagram({ quoteLabel, invoiceLabel, quoteTraits, invoiceTraits, caption }: InvoiceQuoteVsInvoiceDiagramProps) {
  return (
    <figure className="my-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-4 dark:border-fuchsia-400/30 dark:bg-fuchsia-500/10">
          <p className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">{quoteLabel}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-fuchsia-700 dark:text-fuchsia-300">
            {quoteTraits.map((trait) => (
              <li key={trait}>• {trait}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-fuchsia-400 bg-fuchsia-100 p-4 dark:border-fuchsia-400/60 dark:bg-fuchsia-500/20">
          <p className="text-sm font-bold text-fuchsia-800 dark:text-fuchsia-200">{invoiceLabel}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-fuchsia-800 dark:text-fuchsia-200">
            {invoiceTraits.map((trait) => (
              <li key={trait}>• {trait}</li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
