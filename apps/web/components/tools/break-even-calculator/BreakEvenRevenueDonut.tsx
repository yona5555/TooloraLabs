type Segment = { key: string; value: number; label: string; formatted: string; colorClass: string; dotColorClass: string };

type BreakEvenRevenueDonutProps = {
  segments: Segment[];
  ariaLabel: string;
};

const SIZE = 168;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Matches fuel-cost-calculator's EduDonutChart exactly — the site-wide
 * reference for how a donut + its own legend renders (fixed 168x168 SVG
 * via width/height attributes, not a scaling CSS class, so it never grows
 * or shrinks with an arbitrarily wide container; legend beside it on
 * larger screens, below it on narrow ones). Every donut in this tool now
 * shares this one component instead of each having its own slightly
 * different size/layout.
 */
export default function BreakEvenRevenueDonut({ segments, ariaLabel }: BreakEvenRevenueDonutProps) {
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
    <div dir="ltr" className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={ariaLabel} width={SIZE} height={SIZE} className="shrink-0">
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
            strokeLinecap="butt"
            className={arc.colorClass}
            transform={`rotate(-90 ${center} ${center})`}
          />
        ))}
      </svg>
      <ul className="flex flex-col gap-2 text-sm">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dotColorClass}`} />
            <span className="text-zinc-600 dark:text-zinc-300">{s.label}</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{s.formatted}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
