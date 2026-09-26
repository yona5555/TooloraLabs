type Segment = { key: string; value: number; label: string; colorClass: string; dotColorClass: string };

type SalesTaxRateStackDonutProps = {
  segments: Segment[];
  centerValue: string;
  centerLabel: string;
};

const SIZE = 168;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Single continuous donut shape (arcs), not a box+arrow pattern — kept as SVG, matching Break-Even/Fuel's own donut reference exactly. */
export default function SalesTaxRateStackDonut({ segments, centerValue, centerLabel }: SalesTaxRateStackDonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const center = SIZE / 2;

  const { arcs } = segments.reduce<{ arcs: (Segment & { dasharray: string; dashoffset: number })[]; offset: number }>(
    (acc, segment) => {
      const fraction = total > 0 ? segment.value / total : 0;
      const arcLength = fraction * CIRCUMFERENCE;
      const dasharray = `${arcLength} ${CIRCUMFERENCE - arcLength}`;
      const dashoffset = -acc.offset;
      return { arcs: [...acc.arcs, { ...segment, dasharray, dashoffset }], offset: acc.offset + arcLength };
    },
    { arcs: [], offset: 0 }
  );

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
      <div dir="ltr" className="shrink-0">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${centerLabel}: ${centerValue}`} width={SIZE} height={SIZE}>
          <circle cx={center} cy={center} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-zinc-100 dark:stroke-zinc-800" />
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx={center}
              cy={center}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeDasharray={arc.dasharray}
              strokeDashoffset={arc.dashoffset}
              transform={`rotate(-90 ${center} ${center})`}
              className={arc.colorClass}
            />
          ))}
          <text x={center} y={center - 4} textAnchor="middle" fontSize={17} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-50">
            {centerValue}
          </text>
          <text x={center} y={center + 15} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {centerLabel}
          </text>
        </svg>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dotColorClass}`} />
            <span className="text-zinc-600 dark:text-zinc-300">{s.label}</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
