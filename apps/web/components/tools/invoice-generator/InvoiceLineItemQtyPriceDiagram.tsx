type LineItemBox = { key: string; label: string; qty: number; unitPrice: number };

type InvoiceLineItemQtyPriceDiagramProps = {
  items: LineItemBox[];
  lineTotalLabel: string;
  caption: string;
  title: string;
};

const WIDTH = 300;
const ROW_H = 44;
const ROW_GAP = 10;

export default function InvoiceLineItemQtyPriceDiagram({ items, lineTotalLabel, caption, title }: InvoiceLineItemQtyPriceDiagramProps) {
  const height = items.length * (ROW_H + ROW_GAP);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 280 }}>
          {items.map((item, i) => {
            const y = i * (ROW_H + ROW_GAP);
            const lineTotal = item.qty * item.unitPrice;
            return (
              <g key={item.key}>
                <rect x={0} y={y} width={WIDTH} height={ROW_H} rx={6} className="fill-teal-50 stroke-teal-400 dark:fill-teal-500/10 dark:stroke-teal-400/50" strokeWidth={1} />
                <text x={10} y={y + 16} fontSize={9} fontWeight={700} className="fill-teal-800 dark:fill-teal-200">
                  {item.label}
                </text>
                <text x={10} y={y + 32} fontSize={9} className="fill-teal-600 dark:fill-teal-400">
                  {item.qty} × ${item.unitPrice.toFixed(2)}
                </text>
                <text x={WIDTH - 10} y={y + ROW_H / 2 + 4} textAnchor="end" fontSize={12} fontWeight={700} className="fill-teal-700 dark:fill-teal-300">
                  ${lineTotal.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">
        {lineTotalLabel} {caption}
      </figcaption>
    </figure>
  );
}
