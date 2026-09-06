type BalancerConservationScaleDiagramProps = {
  reactantsLabel: string;
  productsLabel: string;
  caption: string;
};

/**
 * A level balance scale — a fixed illustration of the conservation of mass
 * principle a balanced equation encodes: the same number of atoms of each
 * element exists on both sides, so nothing is created or destroyed.
 */
export default function BalancerConservationScaleDiagram({ reactantsLabel, productsLabel, caption }: BalancerConservationScaleDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 240 120" role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <polygon points="110,100 130,100 120,80" className="fill-zinc-400 dark:fill-zinc-500" />
          <line x1={30} y1={40} x2={210} y2={40} stroke="currentColor" strokeWidth={3} className="text-zinc-600 dark:text-zinc-300" />
          <line x1={120} y1={40} x2={120} y2={80} stroke="currentColor" strokeWidth={2} className="text-zinc-600 dark:text-zinc-300" />

          <line x1={30} y1={40} x2={30} y2={55} stroke="currentColor" strokeWidth={1.5} opacity={0.6} />
          <rect x={12} y={55} width={36} height={20} rx={4} className="fill-blue-500/70 stroke-blue-600 dark:stroke-blue-400" strokeWidth={1.2} />

          <line x1={210} y1={40} x2={210} y2={55} stroke="currentColor" strokeWidth={1.5} opacity={0.6} />
          <rect x={192} y={55} width={36} height={20} rx={4} className="fill-emerald-500/70 stroke-emerald-600 dark:stroke-emerald-400" strokeWidth={1.2} />

          <text x={30} y={95} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {reactantsLabel}
          </text>
          <text x={210} y={95} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {productsLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
