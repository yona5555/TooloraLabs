import type { DailyRate } from "@tooloralabs/tools";

type Props = {
  points: DailyRate[];
  /** Landmarks pinned to the first point on or after their date; numbered on the chart. */
  events: { key: string; date: string }[];
  formatValue: (v: number) => string;
  ariaLabel: string;
  testId?: string;
  /** Optional horizontal bands (e.g. ratio zones), drawn behind the line. */
  bands?: { from: number; to: number; className: string }[];
};

const W = 720;
const H = 380;
const PAD = { l: 52, r: 8, t: 14, b: 40 };

/** Trend line with highlighted reference points (§31 type 7): a long series, its range, and numbered landmarks. */
export default function EventTrendChart({ points, events, formatValue, ariaLabel, testId, bands = [] }: Props) {
  if (points.length < 2) return null;
  // ~600 points keep the path light; the extremes below stay exact.
  const step = Math.max(1, Math.floor(points.length / 600));
  const path = points.filter((_, i) => i % step === 0 || i === points.length - 1);
  let hi = points[0];
  let lo = points[0];
  for (const p of points) {
    if (p.rate > hi.rate) hi = p;
    if (p.rate < lo.rate) lo = p;
  }
  const t0 = Date.parse(points[0].date);
  const t1 = Date.parse(points[points.length - 1].date);
  const x = (d: string) => PAD.l + ((Date.parse(d) - t0) / (t1 - t0 || 1)) * (W - PAD.l - PAD.r);
  const y = (r: number) => PAD.t + (1 - (r - lo.rate) / (hi.rate - lo.rate || 1)) * (H - PAD.t - PAD.b);
  const clampY = (r: number) => y(Math.min(hi.rate, Math.max(lo.rate, r)));
  const marks = events.flatMap((e) => {
    const p = points.find((pt) => pt.date >= e.date);
    return p ? [{ ...e, point: p }] : [];
  });
  const last = points[points.length - 1];
  const firstYear = new Date(t0).getUTCFullYear();
  const years = Array.from({ length: 12 }, (_, i) => Math.ceil(firstYear / 5) * 5 + i * 5).filter((yr) => {
    const t = Date.UTC(yr, 0, 1);
    return t > t0 && t < t1;
  });

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel} data-testid={testId}>
      {bands.map((b) => (
        <rect key={b.from} x={PAD.l} width={W - PAD.l - PAD.r} y={clampY(b.to)} height={Math.max(0, clampY(b.from) - clampY(b.to))} className={b.className} />
      ))}
      {years.map((yr) => (
        <text key={yr} x={x(`${yr}-01-01`)} y={H - 22} textAnchor="middle" className="fill-zinc-400 font-mono text-[10px]">
          {yr}
        </text>
      ))}
      {[hi, lo].map((mk) => (
        <g key={`${mk.date}-${mk.rate}`}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(mk.rate)} y2={y(mk.rate)} strokeDasharray="2 4" className="stroke-zinc-300 dark:stroke-zinc-600" />
          <text x={PAD.l - 4} y={y(mk.rate) + 3} textAnchor="end" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">
            {formatValue(mk.rate)}
          </text>
        </g>
      ))}
      <path d={`M ${path.map((p) => `${x(p.date).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" L ")}`} fill="none" strokeWidth={1.5} className="stroke-blue-600 dark:stroke-blue-400" />
      {marks.map((e, i) => (
        <g key={e.key}>
          <line x1={x(e.point.date)} x2={x(e.point.date)} y1={PAD.t} y2={H - PAD.b} strokeDasharray="3 3" className="stroke-zinc-300 dark:stroke-zinc-600" />
          <circle cx={x(e.point.date)} cy={y(e.point.rate)} r={4.5} className="fill-amber-500 stroke-white dark:stroke-zinc-900" strokeWidth={1.5} />
          <text x={x(e.point.date)} y={H - 6} textAnchor="middle" className="fill-amber-600 font-mono text-[11px] font-bold dark:fill-amber-400">
            {i + 1}
          </text>
        </g>
      ))}
      <circle cx={x(last.date)} cy={y(last.rate)} r={4.5} className="fill-blue-600" />
    </svg>
  );
}
