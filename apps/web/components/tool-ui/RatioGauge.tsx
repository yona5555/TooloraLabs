type GaugeZone = {
  key: string;
  from: number;
  to: number;
  colorClass: string;
};

type RatioGaugeProps = {
  value: number;
  domainMin: number;
  domainMax: number;
  zones: GaugeZone[];
  valueLabel: string;
  caption?: string;
  captionColorClass?: string;
  ticks: number[];
  tickFormatter?: (tick: number) => string;
};

const SIZE_W = 240;
const SIZE_H = 152;
const CX = 120;
const CY = 128;
const R = 92;
const STROKE = 22;
const FULL_CIRCUMFERENCE = 2 * Math.PI * R;
const HALF_CIRCUMFERENCE = Math.PI * R;

/**
 * Semi-circle gauge for a result that has a known ceiling/range (e.g. a
 * ratio bucketed into healthy/manageable/high zones). Drawn with the same
 * "one <circle> per arc segment, dasharray/dashoffset" technique used by the
 * per-tool breakdown donuts, just rotated 180deg so the pattern traces the
 * top half only (9 o'clock -> 12 o'clock -> 3 o'clock) instead of a full ring.
 */
export default function RatioGauge({ value, domainMin, domainMax, zones, valueLabel, caption, captionColorClass, ticks, tickFormatter }: RatioGaugeProps) {
  const span = domainMax - domainMin;
  const clampedValue = Math.min(Math.max(value, domainMin), domainMax);

  const { arcs } = zones.reduce<{ arcs: (GaugeZone & { arcLength: number; dashoffset: number })[]; offset: number }>(
    (acc, zone) => {
      const fraction = span > 0 ? (zone.to - zone.from) / span : 0;
      const arcLength = fraction * HALF_CIRCUMFERENCE;
      const dashoffset = -acc.offset;
      return { arcs: [...acc.arcs, { ...zone, arcLength, dashoffset }], offset: acc.offset + arcLength };
    },
    { arcs: [], offset: 0 }
  );

  const needleT = span > 0 ? ((clampedValue - domainMin) / span) * 180 : 0;
  const needleAngleRad = ((needleT + 180) * Math.PI) / 180;
  const needleInnerR = R - STROKE / 2 - 6;
  const needleOuterR = R + STROKE / 2 + 10;
  const needleX1 = CX + needleInnerR * Math.cos(needleAngleRad);
  const needleY1 = CY + needleInnerR * Math.sin(needleAngleRad);
  const needleX2 = CX + needleOuterR * Math.cos(needleAngleRad);
  const needleY2 = CY + needleOuterR * Math.sin(needleAngleRad);

  const tickPoint = (tick: number) => {
    const t = span > 0 ? ((Math.min(Math.max(tick, domainMin), domainMax) - domainMin) / span) * 180 : 0;
    const angleRad = ((t + 180) * Math.PI) / 180;
    const tickR = R + STROKE / 2 + 12;
    // Anchor the extreme ticks toward the inside of the viewBox instead of centering on the point
    // — a centered label at the very end of the arc (0deg/180deg) would run past the SVG's edge.
    const anchor: "start" | "end" | "middle" = t < 15 ? "start" : t > 165 ? "end" : "middle";
    return { x: CX + tickR * Math.cos(angleRad), y: CY + tickR * Math.sin(angleRad), anchor };
  };

  return (
    <div dir="ltr" className="flex flex-col items-center">
      <svg viewBox={`0 0 ${SIZE_W} ${SIZE_H}`} role="img" aria-label={`${valueLabel}${caption ? ` (${caption})` : ""}`} className="w-56">
        <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth={STROKE} strokeDasharray={`${HALF_CIRCUMFERENCE} ${FULL_CIRCUMFERENCE}`} transform={`rotate(180 ${CX} ${CY})`} className="stroke-zinc-100 dark:stroke-zinc-800" />
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            strokeWidth={STROKE}
            strokeDasharray={`${arc.arcLength} ${FULL_CIRCUMFERENCE - arc.arcLength}`}
            strokeDashoffset={arc.dashoffset}
            transform={`rotate(180 ${CX} ${CY})`}
            className={arc.colorClass}
          />
        ))}

        {ticks.map((tick) => {
          const p = tickPoint(tick);
          return (
            <text key={tick} x={p.x} y={p.y} textAnchor={p.anchor} dominantBaseline="middle" fontSize={10} className="fill-zinc-400 dark:fill-zinc-500">
              {tickFormatter ? tickFormatter(tick) : tick}
            </text>
          );
        })}

        <line x1={needleX1} y1={needleY1} x2={needleX2} y2={needleY2} strokeWidth={3} strokeLinecap="round" className="stroke-zinc-900 dark:stroke-zinc-50" />
        <circle cx={needleX2} cy={needleY2} r={4} className="fill-zinc-900 dark:fill-zinc-50" />

        <text x={CX} y={CY - 6} textAnchor="middle" fontSize={22} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-50">
          {valueLabel}
        </text>
        {caption && (
          <text x={CX} y={CY + 16} textAnchor="middle" fontSize={12} fontWeight={600} className={captionColorClass ?? "fill-zinc-500 dark:fill-zinc-400"}>
            {caption}
          </text>
        )}
      </svg>
    </div>
  );
}
