import InvoiceWorkedExampleNote from "./InvoiceWorkedExampleNote";

type InvoiceFlowDiagramProps = {
  subtotalLabel: string;
  discountLabel: string;
  taxLabel: string;
  totalLabel: string;
  caption: string;
  workedExampleTitle: string;
};

/** Worked example matching this tool's own "Example 1" figures used elsewhere on the page (the $598 total also appears in the recurring-billing chart). */
const SUBTOTAL = 650;
const DISCOUNT = 130;
const TAXABLE = SUBTOTAL - DISCOUNT;
const TAX = 78;
const TOTAL = TAXABLE + TAX;

const STOP_ZONE_W = 92;
const ZONE_GAP = 14;
const RESULT_ZONE_W = 140;
const RIBBON_TOP = 20;
const RIBBON_BOTTOM = 76;
const ARROWHEAD_W = 26;
const RIBBON_BODY_END = STOP_ZONE_W * 3 + ZONE_GAP + RESULT_ZONE_W;
const WIDTH = RIBBON_BODY_END + ARROWHEAD_W;
const HEIGHT = 96;

/**
 * §31 type #2 (Flow Arrow with Embedded Numbers): one continuous connected
 * shape carrying the sequential values, not separate bordered boxes with
 * −/+/= operator symbols floating between them — same fix already applied
 * to Fuel Cost/Tip/Discount/Sales Tax Calculator's own formula diagrams.
 */
export default function InvoiceFlowDiagram({ subtotalLabel, discountLabel, taxLabel, totalLabel, caption, workedExampleTitle }: InvoiceFlowDiagramProps) {
  const stops = [
    { label: subtotalLabel, value: `$${SUBTOTAL.toFixed(2)}`, zoneStart: 0 },
    { label: discountLabel, value: `-$${DISCOUNT.toFixed(2)}`, zoneStart: STOP_ZONE_W },
    { label: taxLabel, value: `+$${TAX.toFixed(2)}`, zoneStart: STOP_ZONE_W * 2 },
  ];
  const resultZoneStart = STOP_ZONE_W * 3 + ZONE_GAP;
  const ribbonPath = `M 0 ${RIBBON_TOP} L ${RIBBON_BODY_END} ${RIBBON_TOP} L ${WIDTH} ${(RIBBON_TOP + RIBBON_BOTTOM) / 2} L ${RIBBON_BODY_END} ${RIBBON_BOTTOM} L 0 ${RIBBON_BOTTOM} Z`;

  return (
    <figure className="my-2 flex flex-col gap-6 lg:flex-row lg:items-center">
      <div dir="ltr" className="shrink-0 overflow-x-auto">
        <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="mx-auto block min-w-[300px] text-current">
          <defs>
            <linearGradient id="invoiceFlowRibbon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="currentColor" className="text-blue-400 dark:text-blue-500" stopOpacity={0.85} />
              <stop offset="100%" stopColor="currentColor" className="text-emerald-500 dark:text-emerald-400" stopOpacity={0.95} />
            </linearGradient>
          </defs>
          <path d={ribbonPath} fill="url(#invoiceFlowRibbon)" />

          {stops.map((stop) => (
            <g key={stop.label}>
              <text x={stop.zoneStart + STOP_ZONE_W / 2} y={RIBBON_TOP + 22} textAnchor="middle" fontSize={9} fontWeight={600} fill="white" opacity={0.85}>
                {stop.label}
              </text>
              <text x={stop.zoneStart + STOP_ZONE_W / 2} y={RIBBON_TOP + 40} textAnchor="middle" fontSize={12} fontWeight={700} fill="white" fontFamily="monospace">
                {stop.value}
              </text>
            </g>
          ))}

          <text x={resultZoneStart + RESULT_ZONE_W / 2} y={RIBBON_TOP + 22} textAnchor="middle" fontSize={9} fontWeight={600} fill="white" opacity={0.85}>
            {totalLabel}
          </text>
          <text x={resultZoneStart + RESULT_ZONE_W / 2} y={RIBBON_TOP + 44} textAnchor="middle" fontSize={16} fontWeight={700} fill="white" fontFamily="monospace">
            ${TOTAL.toFixed(2)}
          </text>
        </svg>
        <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
      </div>
      <InvoiceWorkedExampleNote
        title={workedExampleTitle}
        rows={[
          { label: subtotalLabel, value: `$${SUBTOTAL.toFixed(2)}` },
          { label: discountLabel, value: `-$${DISCOUNT.toFixed(2)}` },
          { label: taxLabel, value: `+$${TAX.toFixed(2)}` },
          { label: totalLabel, value: `$${TOTAL.toFixed(2)}`, emphasize: true },
        ]}
      />
    </figure>
  );
}
