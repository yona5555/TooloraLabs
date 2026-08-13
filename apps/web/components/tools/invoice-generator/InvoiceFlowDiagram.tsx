type InvoiceFlowDiagramProps = {
  subtotalLabel: string;
  discountLabel: string;
  taxLabel: string;
  totalLabel: string;
  caption: string;
};

const WIDTH = 480;
const BOX_W = 96;
const BOX_H = 44;
const GAP = 32;
const HEIGHT = BOX_H + 30;

export default function InvoiceFlowDiagram({ subtotalLabel, discountLabel, taxLabel, totalLabel, caption }: InvoiceFlowDiagramProps) {
  const labels = [subtotalLabel, discountLabel, taxLabel, totalLabel];
  const ops = ["", "−", "+", "="];

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 420 }}>
          {labels.map((label, i) => {
            const x = i * (BOX_W + GAP);
            return (
              <g key={label}>
                {i > 0 && (
                  <text x={x - GAP / 2} y={BOX_H / 2 + 5} textAnchor="middle" fontSize={16} fontWeight={700} fill="currentColor">
                    {ops[i]}
                  </text>
                )}
                <rect
                  x={x}
                  y={0}
                  width={BOX_W}
                  height={BOX_H}
                  rx={8}
                  fill="currentColor"
                  opacity={i === labels.length - 1 ? 0.85 : 0.15}
                  stroke="currentColor"
                  strokeWidth={1}
                />
                <text
                  x={x + BOX_W / 2}
                  y={BOX_H / 2 + 5}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={i === labels.length - 1 ? "var(--bg,#faf7ef)" : "currentColor"}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
