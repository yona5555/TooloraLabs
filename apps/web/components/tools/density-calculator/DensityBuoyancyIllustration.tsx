type DensityBuoyancyIllustrationProps = {
  floatsLabel: string;
  sinksLabel: string;
  waterLabel: string;
  caption: string;
};

/**
 * A still-water cross-section with one low-density object resting above the
 * waterline and one high-density object resting on the container floor —
 * the classic "floats vs. sinks" illustration referenced by the specific
 * gravity explanation in the article text above it.
 */
export default function DensityBuoyancyIllustration({ floatsLabel, sinksLabel, waterLabel, caption }: DensityBuoyancyIllustrationProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 300 140" role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <rect x={10} y={10} width={280} height={120} rx={6} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.4} />

          <rect x={10} y={55} width={280} height={65} className="fill-blue-500/10 dark:fill-blue-400/10" />
          <line x1={10} y1={55} x2={290} y2={55} stroke="currentColor" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
          <text x={280} y={48} textAnchor="end" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {waterLabel}
          </text>

          <rect x={55} y={38} width={46} height={26} rx={4} className="fill-amber-400/70 stroke-amber-600 dark:fill-amber-300/60 dark:stroke-amber-400" strokeWidth={1.5} />
          <text x={78} y={90} textAnchor="middle" fontSize={10} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
            {floatsLabel}
          </text>

          <rect x={190} y={96} width={40} height={22} rx={4} className="fill-zinc-500/70 stroke-zinc-700 dark:fill-zinc-400/70 dark:stroke-zinc-300" strokeWidth={1.5} />
          <text x={210} y={132} textAnchor="middle" fontSize={10} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
            {sinksLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
