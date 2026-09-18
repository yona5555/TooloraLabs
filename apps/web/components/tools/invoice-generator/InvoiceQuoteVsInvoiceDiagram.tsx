type InvoiceQuoteVsInvoiceDiagramProps = {
  quoteLabel: string;
  invoiceLabel: string;
  quoteTraits: string[];
  invoiceTraits: string[];
  caption: string;
};

const WIDTH = 300;
const BOX_W = 134;
const BOX_GAP = 16;

export default function InvoiceQuoteVsInvoiceDiagram({ quoteLabel, invoiceLabel, quoteTraits, invoiceTraits, caption }: InvoiceQuoteVsInvoiceDiagramProps) {
  const rowH = 15;
  const boxH = 40 + Math.max(quoteTraits.length, invoiceTraits.length) * rowH;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${boxH + 12}`} role="img" aria-label={`${quoteLabel} vs ${invoiceLabel}`} className="h-auto w-full" style={{ minWidth: 280 }}>
          <rect x={0} y={0} width={BOX_W} height={boxH} rx={8} className="fill-fuchsia-50 stroke-fuchsia-400 dark:fill-fuchsia-500/10 dark:stroke-fuchsia-400/60" strokeWidth={1.5} />
          <text x={BOX_W / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-fuchsia-700 dark:fill-fuchsia-300">
            {quoteLabel}
          </text>
          {quoteTraits.map((tItem, i) => (
            <text key={tItem} x={12} y={38 + i * rowH} fontSize={8.5} className="fill-fuchsia-700 dark:fill-fuchsia-300">
              • {tItem}
            </text>
          ))}

          <rect x={BOX_W + BOX_GAP} y={0} width={BOX_W} height={boxH} rx={8} className="fill-fuchsia-100 stroke-fuchsia-600 dark:fill-fuchsia-500/20 dark:stroke-fuchsia-400" strokeWidth={1.5} />
          <text x={BOX_W + BOX_GAP + BOX_W / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-fuchsia-800 dark:fill-fuchsia-200">
            {invoiceLabel}
          </text>
          {invoiceTraits.map((tItem, i) => (
            <text key={tItem} x={BOX_W + BOX_GAP + 12} y={38 + i * rowH} fontSize={8.5} className="fill-fuchsia-800 dark:fill-fuchsia-200">
              • {tItem}
            </text>
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
