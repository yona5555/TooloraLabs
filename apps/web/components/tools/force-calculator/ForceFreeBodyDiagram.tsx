type ForceFreeBodyDiagramProps = {
  appliedLabel: string;
  netLabel: string;
  caption: string;
};

/**
 * A simple free-body diagram: a block with one applied force arrow and the
 * resulting net-force arrow, illustrating F = ma conceptually rather than
 * with any one result's live numbers.
 */
export default function ForceFreeBodyDiagram({ appliedLabel, netLabel, caption }: ForceFreeBodyDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 260 110" role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <rect x={110} y={45} width={40} height={30} rx={4} className="fill-zinc-300/40 stroke-zinc-500 dark:fill-zinc-700/40 dark:stroke-zinc-400" strokeWidth={1.5} />

          <defs>
            <marker id="fbd-arrow" markerWidth={8} markerHeight={8} refX={6} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-blue-600 dark:fill-blue-400" />
            </marker>
          </defs>

          <line x1={40} y1={60} x2={105} y2={60} stroke="currentColor" strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" markerEnd="url(#fbd-arrow)" />
          <text x={72} y={48} textAnchor="middle" fontSize={10} fontWeight={600} className="fill-blue-700 dark:fill-blue-300">
            {appliedLabel}
          </text>

          <line x1={155} y1={60} x2={220} y2={60} stroke="currentColor" strokeWidth={2.5} strokeDasharray="4 3" className="text-zinc-500 dark:text-zinc-400" markerEnd="url(#fbd-arrow)" />
          <text x={188} y={90} textAnchor="middle" fontSize={10} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
            {netLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
