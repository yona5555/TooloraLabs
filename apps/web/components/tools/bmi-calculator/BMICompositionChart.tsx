type CompositionChartProps = {
  bmiLabel: string;
  muscularLabel: string;
  fatLabel: string;
};

function MuscularFigure() {
  return (
    <g transform="translate(0, 0)" className="text-zinc-800 dark:text-zinc-200">
      <circle cx={50} cy={18} r={13} fill="none" stroke="currentColor" strokeWidth={2} />
      <path
        d="M 20 34 L 30 50 L 26 90 L 74 90 L 70 50 L 80 34 Q 65 44 50 44 Q 35 44 20 34 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {[38, 44, 56, 62].map((x) => (
        <line key={x} x1={x} y1={52} x2={x} y2={84} stroke="currentColor" strokeWidth={1} strokeOpacity={0.5} />
      ))}
      <line x1={38} y1={90} x2={38} y2={132} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1={62} y1={90} x2={62} y2={132} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function HigherFatFigure() {
  const dots: [number, number][] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      dots.push([34 + col * 8, 48 + row * 8]);
    }
  }

  return (
    <g transform="translate(0, 0)" className="text-zinc-800 dark:text-zinc-200">
      <circle cx={50} cy={18} r={13} fill="none" stroke="currentColor" strokeWidth={2} />
      <path
        d="M 27 34 Q 18 60 24 90 L 76 90 Q 82 60 73 34 Q 50 44 27 34 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.2} fill="currentColor" fillOpacity={0.5} />
      ))}
      <line x1={36} y1={90} x2={36} y2={132} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <line x1={64} y1={90} x2={64} y2={132} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

export default function BMICompositionChart({ bmiLabel, muscularLabel, fatLabel }: CompositionChartProps) {
  return (
    <svg viewBox="0 0 220 172" role="img" className="mx-auto w-full max-w-xs">
      <g transform="translate(0, 0)">
        <MuscularFigure />
        <text x={50} y={150} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-200">
          {bmiLabel}
        </text>
        <text x={50} y={164} textAnchor="middle" fontSize={9} className="fill-zinc-800 dark:fill-zinc-200" fillOpacity={0.7}>
          {muscularLabel}
        </text>
      </g>
      <g transform="translate(120, 0)">
        <HigherFatFigure />
        <text x={50} y={150} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-200">
          {bmiLabel}
        </text>
        <text x={50} y={164} textAnchor="middle" fontSize={9} className="fill-zinc-800 dark:fill-zinc-200" fillOpacity={0.7}>
          {fatLabel}
        </text>
      </g>
    </svg>
  );
}
