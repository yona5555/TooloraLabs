type MolarMassCompositionBarDiagramProps = {
  segments: { symbol: string; percent: number }[];
  caption: string;
};

const COLORS = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-cyan-500"];

/**
 * A live stacked bar showing each element's percent contribution to the
 * total molar mass — computed directly from this result's breakdown
 * (subtotal / total mass), not a separately tracked statistic.
 */
export default function MolarMassCompositionBarDiagram({ segments, caption }: MolarMassCompositionBarDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="mx-auto max-w-sm">
        <div className="flex h-6 w-full overflow-hidden rounded-full border border-zinc-300 dark:border-zinc-700">
          {segments.map((seg, i) => (
            <div key={seg.symbol} className={COLORS[i % COLORS.length]} style={{ width: `${seg.percent}%` }} title={`${seg.symbol}: ${seg.percent.toFixed(1)}%`} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          {segments.map((seg, i) => (
            <span key={seg.symbol} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${COLORS[i % COLORS.length]}`} />
              {seg.symbol} {seg.percent.toFixed(1)}%
            </span>
          ))}
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
