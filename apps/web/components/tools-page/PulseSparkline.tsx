/** The ticker chips' 44×18 trend line (/tools, category pages, the crypto phone pilot). */
export default function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  const w = 44;
  const h = 18;
  const min = Math.min(...points);
  const span = Math.max(...points) - min || 1;
  const d = points.map((p, i) => `${((i / (points.length - 1)) * w).toFixed(1)},${(h - 1 - ((p - min) / span) * (h - 2)).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className={`shrink-0 ${up ? "text-emerald-500" : "text-red-500"}`}>
      <polyline points={d} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
