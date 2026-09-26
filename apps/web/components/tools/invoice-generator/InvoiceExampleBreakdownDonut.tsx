type Segment = { key: string; value: number; label: string; colorClass: string };

type InvoiceExampleBreakdownDonutProps = {
  segments: Segment[];
  centerValue: string;
  centerLabel: string;
};

const SIZE = 168;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Single continuous SVG ring — a legitimate quantitative shape, not bordered boxes linked by arrows. */
export default function InvoiceExampleBreakdownDonut({ segments, centerValue, centerLabel }: InvoiceExampleBreakdownDonutProps) {
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
    { arcs: [], offset: 0 },
  );

  return (
    <div className="flex flex-col items-center">
      <div dir="ltr">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${centerLabel}: ${centerValue}`} className="w-40">
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
      <div className="mt-2 grid w-full max-w-[220px] grid-cols-1 gap-1 text-xs">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
              <span className={`h-2 w-2 rounded-full ${s.colorClass.replace(/stroke-/g, "bg-")}`} />
              {s.label}
            </span>
            <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">${s.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
