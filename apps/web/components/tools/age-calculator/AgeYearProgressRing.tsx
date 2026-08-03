type AgeYearProgressRingProps = {
  percent: number;
  years: number;
  label: string;
  yearsLabel: string;
};

const SIZE = 168;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AgeYearProgressRing({ percent, years, label, yearsLabel }: AgeYearProgressRingProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const center = SIZE / 2;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`${label}: ${clamped}%`}
      className="mx-auto w-44"
    >
      <circle
        cx={center}
        cy={center}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        className="stroke-zinc-100 dark:stroke-zinc-800"
      />
      <circle
        cx={center}
        cy={center}
        r={RADIUS}
        fill="none"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        className="stroke-blue-600 transition-[stroke-dashoffset] duration-700 ease-out dark:stroke-blue-400"
      />
      <text
        x={center}
        y={center - 8}
        textAnchor="middle"
        fontSize={34}
        fontWeight={700}
        className="fill-zinc-900 dark:fill-zinc-50"
      >
        {years}
      </text>
      <text x={center} y={center + 16} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
        {yearsLabel}
      </text>
      <text x={center} y={center + 34} textAnchor="middle" fontSize={11} className="fill-blue-600 dark:fill-blue-400">
        {clamped}%
      </text>
    </svg>
  );
}
