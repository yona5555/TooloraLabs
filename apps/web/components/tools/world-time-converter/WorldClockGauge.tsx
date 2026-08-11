type WorldClockGaugeProps = {
  fromHour: number;
  toHour: number;
  fromLabel: string;
  toLabel: string;
  dayLabel: string;
  nightLabel: string;
};

const WIDTH = 400;
const BAR_Y = 16;
const BAR_HEIGHT = 22;

function scaleX(hour: number) {
  const clamped = ((hour % 24) + 24) % 24;
  return (clamped / 24) * WIDTH;
}

function Marker({ hour, color, shape }: { hour: number; color: string; shape: "circle" | "diamond" }) {
  const x = scaleX(hour);
  const y = BAR_Y + BAR_HEIGHT / 2;
  return shape === "circle" ? (
    <circle cx={x} cy={y} r={7} fill="white" stroke={color} strokeWidth={3} />
  ) : (
    <rect x={x - 6} y={y - 6} width={12} height={12} fill="white" stroke={color} strokeWidth={3} transform={`rotate(45 ${x} ${y})`} />
  );
}

export default function WorldClockGauge({ fromHour, toHour, fromLabel, toLabel, dayLabel, nightLabel }: WorldClockGaugeProps) {
  const ticks = [0, 6, 12, 18, 24];

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`-16 0 ${WIDTH + 32} 66`} role="img" aria-label={`${fromLabel} / ${toLabel}`} className="w-full">
        {/* Night 0-6 */}
        <rect x={scaleX(0)} y={BAR_Y} width={scaleX(6)} height={BAR_HEIGHT} className="fill-zinc-800 dark:fill-zinc-950" />
        {/* Day 6-18 */}
        <rect x={scaleX(6)} y={BAR_Y} width={scaleX(18) - scaleX(6)} height={BAR_HEIGHT} className="fill-amber-300 dark:fill-amber-500/70" />
        {/* Night 18-24 */}
        <rect x={scaleX(18)} y={BAR_Y} width={WIDTH - scaleX(18)} height={BAR_HEIGHT} className="fill-zinc-800 dark:fill-zinc-950" />

        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={scaleX(tick === 24 ? 0 : tick) + (tick === 24 ? WIDTH : 0)}
              y1={BAR_Y + BAR_HEIGHT}
              x2={scaleX(tick === 24 ? 0 : tick) + (tick === 24 ? WIDTH : 0)}
              y2={BAR_Y + BAR_HEIGHT + 5}
              stroke="currentColor"
              strokeOpacity={0.3}
              className="text-zinc-400 dark:text-zinc-600"
            />
            <text
              x={scaleX(tick === 24 ? 0 : tick) + (tick === 24 ? WIDTH : 0)}
              y={BAR_Y + BAR_HEIGHT + 18}
              fontSize={10}
              textAnchor="middle"
              fill="currentColor"
              className="text-zinc-500 dark:text-zinc-400"
            >
              {tick}
            </text>
          </g>
        ))}

        <Marker hour={fromHour} color="#2563eb" shape="circle" />
        <Marker hour={toHour} color="#db2777" shape="diamond" />
      </svg>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-blue-600 bg-white" />
          {fromLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rotate-45 border-2 border-pink-600 bg-white" />
          {toLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-300 dark:bg-amber-500/70" />
          {dayLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-800 dark:bg-zinc-950" />
          {nightLabel}
        </span>
      </div>
    </div>
  );
}
