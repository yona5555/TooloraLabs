/**
 * Lightweight, non-interactive SVG donut chart shared by this tool's education-page
 * diagrams, for showing relative share among a small set of real computed values.
 * Pure presentational (no "use client", no hooks) so it costs zero client JS.
 */
type Segment = { key: string; label: string; value: number; formatted: string; colorClass: string; dotColorClass: string };

type Props = {
  segments: Segment[];
  ariaLabel: string;
};

const SIZE = 168;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function EduDonutChart({ segments, ariaLabel }: Props) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const center = SIZE / 2;

  const { arcs } = segments.reduce<{ arcs: (typeof segments[number] & { dasharray: string; dashoffset: number })[]; offset: number }>(
    (acc, s) => {
      const fraction = total > 0 ? s.value / total : 0;
      const arcLength = fraction * CIRCUMFERENCE;
      const dasharray = `${arcLength} ${CIRCUMFERENCE - arcLength}`;
      const dashoffset = -acc.offset;
      return { arcs: [...acc.arcs, { ...s, dasharray, dashoffset }], offset: acc.offset + arcLength };
    },
    { arcs: [], offset: 0 },
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
