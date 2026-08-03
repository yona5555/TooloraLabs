type Segment = {
  key: string;
  value: number;
  label: string;
  colorClass: string;
};

type MortgagePaymentDonutProps = {
  segments: Segment[];
  centerValue: string;
  centerLabel: string;
};

const SIZE = 176;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MortgagePaymentDonut({ segments, centerValue, centerLabel }: MortgagePaymentDonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const center = SIZE / 2;

  const { arcs } = segments
    .filter((s) => s.value > 0)
    .reduce<{ arcs: (Segment & { dasharray: string; dashoffset: number })[]; offset: number }>(
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
    <div dir="ltr" className="flex flex-col items-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${centerLabel}: ${centerValue}`} className="w-44">
        <circle
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-zinc-100 dark:stroke-zinc-800"
        />
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
            className={`transition-all duration-700 ease-out ${arc.colorClass}`}
          />
        ))}
        <text x={center} y={center - 6} textAnchor="middle" fontSize={22} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-50">
          {centerValue}
        </text>
        <text x={center} y={center + 16} textAnchor="middle" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
          {centerLabel}
        </text>
      </svg>

      <div className="mt-3 grid w-full grid-cols-1 gap-1.5 text-xs">
        {segments
          .filter((s) => s.value > 0)
          .map((segment) => (
            <div key={segment.key} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                <span className={`h-2 w-2 rounded-full ${segment.colorClass.replace(/stroke-/g, "bg-")}`} />
                {segment.label}
              </span>
              <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                {total > 0 ? `${Math.round((segment.value / total) * 100)}%` : "0%"}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
