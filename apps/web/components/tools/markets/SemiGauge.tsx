type Zone = { to: number; className: string };

type SemiGaugeProps = {
  value: number;
  min?: number;
  max: number;
  /** Coloured bands from `min` upward; the last one should end at `max`. */
  zones: Zone[];
  ticks: { value: number; label: string }[];
  ariaLabel: string;
  testId?: string;
};

const W = 240;
const H = 140;
const R = 100;
const CX = W / 2;
const CY = 120;

/** A half-circle gauge (§31 type 8) with coloured zones and a needle; numbers are always LTR. */
export default function SemiGauge({ value, min = 0, max, zones, ticks, ariaLabel, testId }: SemiGaugeProps) {
  const polar = (v: number, r = R) => {
    const a = Math.PI * (1 - Math.min(1, Math.max(0, (v - min) / (max - min))));
    return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
  };
  const arc = (from: number, to: number) => {
    const [x1, y1] = polar(from);
    const [x2, y2] = polar(to);
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };
  const [nx, ny] = polar(value, R - 18);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} data-testid={testId}>
      {zones.map((z, i) => (
        <path key={z.to} d={arc(i === 0 ? min : zones[i - 1].to, z.to)} fill="none" strokeWidth={18} className={z.className} />
      ))}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={3} strokeLinecap="round" className="stroke-zinc-800 transition-all duration-700 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={6} className="fill-zinc-800 dark:fill-zinc-100" />
      {ticks.map((tk) => {
        const [x, y] = polar(tk.value, R + 14);
        return (
          <text key={tk.value} x={x} y={y} textAnchor="middle" className="fill-zinc-400 font-mono text-[9px]">
            {tk.label}
          </text>
        );
      })}
    </svg>
  );
}
