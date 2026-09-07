type StoichiometryUnitsCompareDiagramProps = {
  caption: string;
  labels: string[];
};

const REFERENCE_POINTS = [
  { formula: "H₂", grams: 2 },
  { formula: "H₂O", grams: 18 },
  { formula: "NaCl", grams: 58.4 },
  { formula: "C₆H₁₂O₆", grams: 180 },
];
const MIN_LOG = 0;
const MAX_LOG = 2.4;
const WIDTH = 320;
const MARGIN = 18;
const AXIS_WIDTH = WIDTH - MARGIN * 2;
const HEIGHT = 60;
const AXIS_Y = 24;

function xForValue(value: number): number {
  const log = Math.log10(value);
  const clamped = Math.min(MAX_LOG, Math.max(MIN_LOG, log));
  return MARGIN + ((clamped - MIN_LOG) / (MAX_LOG - MIN_LOG)) * AXIS_WIDTH;
}

/**
 * A fixed illustrative scale showing that "1 mole" is a wildly different
 * mass depending on the substance — from 2 g for hydrogen gas to 180 g
 * for glucose — which is exactly why molar mass, not a universal
 * constant, is the conversion factor stoichiometry needs.
 */
export default function StoichiometryUnitsCompareDiagram({ caption, labels }: StoichiometryUnitsCompareDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-sm text-current">
          <line x1={MARGIN} y1={AXIS_Y} x2={WIDTH - MARGIN} y2={AXIS_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          {REFERENCE_POINTS.map((point, index) => {
            const x = xForValue(point.grams);
            const staggered = index % 2 === 1;
            const labelY = staggered ? AXIS_Y + 32 : AXIS_Y + 20;
            return (
              <g key={point.formula}>
                <line x1={x} y1={AXIS_Y - 5} x2={x} y2={staggered ? AXIS_Y + 12 : AXIS_Y + 5} stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
                <text x={x} y={labelY} fontSize={9} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
                  {labels[index]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
