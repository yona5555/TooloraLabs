type LineItem = { key: string; label: string; amount: number };

type InvoiceExampleLineBreakdownBarProps = {
  items: LineItem[];
  taxAmount: number;
  taxLabel: string;
  totalLabel: string;
  caption: string;
  title: string;
};

const WIDTH = 200;
const HEIGHT = 170;
const BAR_X = 70;
const BAR_W = 60;
const CHART_TOP = 14;
const CHART_BOTTOM = HEIGHT - 12;
const CHART_H = CHART_BOTTOM - CHART_TOP;

const COLORS = ["fill-emerald-400 dark:fill-emerald-400/80", "fill-emerald-600 dark:fill-emerald-300"];

export default function InvoiceExampleLineBreakdownBar({ items, taxAmount, taxLabel, totalLabel, caption, title }: InvoiceExampleLineBreakdownBarProps) {
  const total = items.reduce((s, i) => s + i.amount, 0) + taxAmount;
  const scale = CHART_H / total;

  const stackInputs = [
    ...items.map((item, i) => ({ key: item.key, label: item.label, amount: item.amount, colorClass: COLORS[i % COLORS.length] })),
    { key: "tax", label: taxLabel, amount: taxAmount, colorClass: "fill-amber-500 dark:fill-amber-400" },
  ];
  const { segments } = stackInputs.reduce<{ segments: { key: string; label: string; y: number; h: number; colorClass: string }[]; cursor: number }>(
    (acc, input) => {
      const h = input.amount * scale;
      const y = acc.cursor - h;
      return { segments: [...acc.segments, { key: input.key, label: input.label, y, h, colorClass: input.colorClass }], cursor: y };
    },
    { segments: [], cursor: CHART_BOTTOM },
  );

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="mx-auto block h-auto" style={{ width: 200 }}>
          <line x1={BAR_X} y1={CHART_BOTTOM} x2={BAR_X + BAR_W} y2={CHART_BOTTOM} stroke="currentColor" strokeWidth={1} opacity={0.2} />
          {segments.map((seg) => (
            <g key={seg.key}>
              <rect x={BAR_X} y={seg.y} width={BAR_W} height={Math.max(seg.h, 2)} className={seg.colorClass} />
              <text x={BAR_X - 6} y={seg.y + seg.h / 2 + 3} textAnchor="end" fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
                {seg.label}
              </text>
            </g>
          ))}
          <text x={BAR_X + BAR_W / 2} y={CHART_TOP - 4} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
            {totalLabel}: ${total.toFixed(2)}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
