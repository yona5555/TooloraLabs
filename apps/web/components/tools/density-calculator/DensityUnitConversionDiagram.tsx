type DensityUnitConversionDiagramProps = {
  density: string;
  densitySI: string;
  specificGravity: string;
  siStepLabel: string;
  sgStepLabel: string;
  caption: string;
};

/**
 * A left-to-right flow of how the headline density value turns into its two
 * derived figures: multiply by 1000 for the SI (kg/m3) value, and divide by
 * water's density for specific gravity. Structural, not data-driven — the
 * boxes' positions never move, only their text. Generously spaced so the
 * step labels never touch the boxes or the diagram's own edges.
 */
export default function DensityUnitConversionDiagram({ density, densitySI, specificGravity, siStepLabel, sgStepLabel, caption }: DensityUnitConversionDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 340 170" role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <rect x={8} y={65} width={90} height={42} rx={8} className="fill-blue-600/15 stroke-blue-600 dark:fill-blue-400/15 dark:stroke-blue-400" strokeWidth={1.5} />
          <text x={53} y={89} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {density}
          </text>
          <text x={53} y={101} textAnchor="middle" fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
            g/cm³
          </text>

          <line x1={102} y1={72} x2={168} y2={35} stroke="currentColor" strokeWidth={1.2} opacity={0.5} markerEnd="url(#dcd-arrow)" />
          <text x={135} y={22} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {siStepLabel}
          </text>
          <rect x={172} y={10} width={100} height={38} rx={8} className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-800 dark:stroke-zinc-600" strokeWidth={1.2} />
          <text x={222} y={30} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
            {densitySI}
          </text>
          <text x={222} y={42} textAnchor="middle" fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
            kg/m³
          </text>

          <line x1={102} y1={100} x2={168} y2={137} stroke="currentColor" strokeWidth={1.2} opacity={0.5} markerEnd="url(#dcd-arrow)" />
          <text x={135} y={155} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
            {sgStepLabel}
          </text>
          <rect x={172} y={112} width={100} height={38} rx={8} className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-800 dark:stroke-zinc-600" strokeWidth={1.2} />
          <text x={222} y={132} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
            {specificGravity}
          </text>
          <text x={222} y={144} textAnchor="middle" fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
            SG
          </text>

          <defs>
            <marker id="dcd-arrow" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity={0.6} />
            </marker>
          </defs>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
