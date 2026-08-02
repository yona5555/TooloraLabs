type Level = { bmi: number; label: string };

const FIGURE_WIDTH = 80;
const DOMAIN_MIN = 15;
const DOMAIN_MAX = 45;

function widthFactor(bmi: number) {
  const clamped = Math.min(Math.max(bmi, DOMAIN_MIN), DOMAIN_MAX);
  return (clamped - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN);
}

function Figure({ bmi, label, index }: { bmi: number; label: string; index: number }) {
  const factor = widthFactor(bmi);
  const shoulderHalf = 13 + factor * 9;
  const hipHalf = 11 + factor * 15;
  const legGap = 4 + factor * 6;

  return (
    <g transform={`translate(${index * FIGURE_WIDTH}, 0)`} className="text-zinc-800 dark:text-zinc-200">
      <circle cx={40} cy={18} r={13} fill="none" stroke="currentColor" strokeWidth={2} />
      <path
        d={`M ${40 - shoulderHalf} 34
            Q ${40 - shoulderHalf - 4} 60 ${40 - hipHalf} 90
            L ${40 + hipHalf} 90
            Q ${40 + shoulderHalf + 4} 60 ${40 + shoulderHalf} 34
            Z`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <line x1={40 - legGap - 5} y1={90} x2={40 - legGap - 5} y2={132} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1={40 + legGap + 5} y1={90} x2={40 + legGap + 5} y2={132} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <text x={40} y={150} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
        {bmi}
      </text>
      <text x={40} y={164} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.7}>
        {label}
      </text>
    </g>
  );
}

export default function BMIBodyLevelsChart({ levels }: { levels: Level[] }) {
  const width = levels.length * FIGURE_WIDTH;

  return (
    <svg viewBox={`0 0 ${width} 172`} role="img" className="mx-auto w-full max-w-md">
      {levels.map((level, index) => (
        <Figure key={level.bmi} bmi={level.bmi} label={level.label} index={index} />
      ))}
    </svg>
  );
}
