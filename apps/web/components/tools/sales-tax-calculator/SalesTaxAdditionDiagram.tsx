type SalesTaxAdditionDiagramProps = {
  subtotalLabel: string;
  taxLabel: string;
  totalLabel: string;
  caption: string;
};

const WIDTH = 320;
const BAR_HEIGHT = 26;
const ROW_GAP = 20;
const HEIGHT = BAR_HEIGHT * 2 + ROW_GAP + 4;

// Illustrative, not data-driven: $100 subtotal + 8% tax ($8) = $108 total.
const SUBTOTAL_FRACTION = 100 / 108;

export default function SalesTaxAdditionDiagram({ subtotalLabel, taxLabel, totalLabel, caption }: SalesTaxAdditionDiagramProps) {
  const subtotalWidth = WIDTH * SUBTOTAL_FRACTION;
  const taxWidth = WIDTH - subtotalWidth;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 280 }}>
          <g>
            <rect x={0} y={0} width={WIDTH} height={BAR_HEIGHT} rx={4} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.3} />
            <rect x={0} y={0} width={subtotalWidth} height={BAR_HEIGHT} rx={4} fill="currentColor" opacity={0.35} />
            <text x={8} y={BAR_HEIGHT / 2 + 4} fontSize={11} fontWeight={700} fill="currentColor">
              {subtotalLabel}
            </text>
          </g>
          <g>
            {(() => {
              const y = BAR_HEIGHT + ROW_GAP;
              return (
                <>
                  <rect x={0} y={y} width={WIDTH} height={BAR_HEIGHT} rx={4} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.3} />
                  <rect x={0} y={y} width={subtotalWidth} height={BAR_HEIGHT} rx={4} fill="currentColor" opacity={0.35} />
                  <rect x={subtotalWidth} y={y} width={taxWidth} height={BAR_HEIGHT} rx={4} fill="currentColor" opacity={0.7} />
                  <text x={8} y={y + BAR_HEIGHT / 2 + 4} fontSize={11} fontWeight={700} fill="currentColor">
                    {totalLabel}
                  </text>
                  <text
                    x={subtotalWidth + taxWidth / 2}
                    y={y + BAR_HEIGHT / 2 + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fill="currentColor"
                  >
                    {taxWidth > 36 ? taxLabel : ""}
                  </text>
                </>
              );
            })()}
          </g>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
