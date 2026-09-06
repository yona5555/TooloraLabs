type EnergyPowerRateDiagramProps = {
  workLabel: string;
  timeLabel: string;
  caption: string;
};

/**
 * Work delivered over a span of time, shown as a filled bar against a time
 * axis — power is the rate that fill happens, so a shorter time axis for
 * the same work reads as a "faster fill," matching the P = work / time
 * relationship conceptually rather than to any real timescale.
 */
export default function EnergyPowerRateDiagram({ workLabel, timeLabel, caption }: EnergyPowerRateDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 260 90" role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <rect x={20} y={30} width={220} height={24} rx={6} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          <rect x={20} y={30} width={220} height={24} rx={6} className="fill-blue-500/25" />
          <text x={130} y={46} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {workLabel}
          </text>

          <line x1={20} y1={64} x2={240} y2={64} stroke="currentColor" strokeWidth={1} opacity={0.4} />
          <text x={130} y={78} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {timeLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
