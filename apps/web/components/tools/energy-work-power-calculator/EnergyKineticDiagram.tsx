type EnergyKineticDiagramProps = {
  massLabel: string;
  velocityLabel: string;
  caption: string;
};

/**
 * A block in motion with a velocity arrow whose length scales with mass
 * (a heavier block drawn larger) purely for visual variety between mode
 * diagrams — not a precise physical scale drawing.
 */
export default function EnergyKineticDiagram({ massLabel, velocityLabel, caption }: EnergyKineticDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 260 100" role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <line x1={10} y1={80} x2={250} y2={80} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />

          <rect x={40} y={48} width={36} height={30} rx={4} className="fill-blue-500/25 stroke-blue-600 dark:fill-blue-400/20 dark:stroke-blue-400" strokeWidth={1.5} />
          <text x={58} y={68} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {massLabel}
          </text>

          <defs>
            <marker id="kinetic-arrow" markerWidth={8} markerHeight={8} refX={6} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-zinc-500 dark:fill-zinc-400" />
            </marker>
          </defs>
          <line x1={90} y1={40} x2={190} y2={40} stroke="currentColor" strokeWidth={2} className="text-zinc-500 dark:text-zinc-400" markerEnd="url(#kinetic-arrow)" />
          <text x={140} y={30} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {velocityLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
