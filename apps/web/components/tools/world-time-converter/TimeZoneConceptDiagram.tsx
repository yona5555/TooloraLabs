type ClockExample = { label: string; offsetLabel: string; hour: number; minute: number };

const EXAMPLES: ClockExample[] = [
  { label: "Los Angeles", offsetLabel: "UTC−8", hour: 4, minute: 0 },
  { label: "London", offsetLabel: "UTC+0", hour: 12, minute: 0 },
  { label: "Riyadh", offsetLabel: "UTC+3", hour: 15, minute: 0 },
  { label: "Tokyo", offsetLabel: "UTC+9", hour: 21, minute: 0 },
];

const CLOCK_R = 26;
const SPACING = 110;
const CLOCK_Y = 70;

function clockHandPoints(hour: number, minute: number) {
  const hourAngle = ((hour % 12) + minute / 60) * 30 - 90;
  const minuteAngle = minute * 6 - 90;
  const hourRad = (hourAngle * Math.PI) / 180;
  const minuteRad = (minuteAngle * Math.PI) / 180;
  return {
    hourX: Math.cos(hourRad) * (CLOCK_R * 0.55),
    hourY: Math.sin(hourRad) * (CLOCK_R * 0.55),
    minuteX: Math.cos(minuteRad) * (CLOCK_R * 0.8),
    minuteY: Math.sin(minuteRad) * (CLOCK_R * 0.8),
  };
}

type TimeZoneConceptDiagramProps = {
  sameInstantLabel: string;
  caption: string;
};

export default function TimeZoneConceptDiagram({ sameInstantLabel, caption }: TimeZoneConceptDiagramProps) {
  const width = EXAMPLES.length * SPACING;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} 150`} role="img" aria-label={caption} className="h-auto w-full" style={{ minWidth: 480 }}>
          <line x1={SPACING / 2} y1={18} x2={width - SPACING / 2} y2={18} stroke="currentColor" strokeWidth={1.5} />
          <text x={width / 2} y={12} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
            {sameInstantLabel}
          </text>

          {EXAMPLES.map((example, i) => {
            const cx = SPACING / 2 + i * SPACING;
            const { hourX, hourY, minuteX, minuteY } = clockHandPoints(example.hour, example.minute);
            return (
              <g key={example.label}>
                <line x1={cx} y1={18} x2={cx} y2={CLOCK_Y - CLOCK_R - 6} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />

                <circle cx={cx} cy={CLOCK_Y} r={CLOCK_R} fill="none" stroke="currentColor" strokeWidth={1.5} />
                {[0, 3, 6, 9].map((h) => {
                  const angle = ((h * 30 - 90) * Math.PI) / 180;
                  const tx = cx + Math.cos(angle) * (CLOCK_R - 4);
                  const ty = CLOCK_Y + Math.sin(angle) * (CLOCK_R - 4);
                  return <circle key={h} cx={tx} cy={ty} r={1.3} fill="currentColor" />;
                })}
                <line x1={cx} y1={CLOCK_Y} x2={cx + hourX} y2={CLOCK_Y + hourY} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
                <line x1={cx} y1={CLOCK_Y} x2={cx + minuteX} y2={CLOCK_Y + minuteY} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                <circle cx={cx} cy={CLOCK_Y} r={2} fill="currentColor" />

                <text x={cx} y={CLOCK_Y + CLOCK_R + 20} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
                  {example.label}
                </text>
                <text x={cx} y={CLOCK_Y + CLOCK_R + 36} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.75}>
                  {example.offsetLabel}
                </text>
                <text x={cx} y={CLOCK_Y + CLOCK_R + 50} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="currentColor">
                  {String(example.hour).padStart(2, "0")}:{String(example.minute).padStart(2, "0")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
