type Point = { label: string; sub: string; value: number; display: string; delta: string };

const TONE = [
  "border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-500/10",
  "border-blue-400 bg-blue-50 dark:border-blue-400/60 dark:bg-blue-500/10",
  "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10",
];
const BAR = ["bg-red-500", "bg-blue-600", "bg-emerald-500"];

/** The low / now / high columns of a sensitivity trio (§31 type 12); bar heights scale to the largest value. */
export default function SensitivityBars({ points }: { points: [Point, Point, Point] }) {
  const max = Math.max(...points.map((p) => p.value), 1e-12);
  return (
    <div className="grid min-w-0 grid-cols-3 gap-3" data-testid="sensitivity-trio">
      {points.map((p, i) => (
        <div key={i} className={`flex min-w-0 flex-col rounded-xl border p-3 ${TONE[i]}`}>
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{p.label}</span>
          <span dir="ltr" className="truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {p.sub}
          </span>
          <div className="mt-2 flex h-24 items-end">
            <div className={`w-full rounded-t-md ${BAR[i]}`} style={{ height: `${(p.value / max) * 100}%` }} />
          </div>
          <span dir="ltr" className="mt-2 truncate font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {p.display}
          </span>
          <span dir="ltr" className="truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {p.delta}
          </span>
        </div>
      ))}
    </div>
  );
}
