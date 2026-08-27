type Quantity = "voltage" | "current" | "resistance";

type OhmsLawTriangleDiagramProps = {
  voltageText: string;
  currentText: string;
  resistanceText: string;
  highlighted: Quantity[];
  caption: string;
};

const WIDTH = 260;
const HEIGHT = 170;

/**
 * The classic Ohm's Law mnemonic triangle (V over I x R), rendered with the
 * actual computed V/I/R values for this result — not placeholder labels —
 * with the quantity that was solved for (rather than directly entered) highlighted.
 */
export default function OhmsLawTriangleDiagram({
  voltageText,
  currentText,
  resistanceText,
  highlighted,
  caption,
}: OhmsLawTriangleDiagramProps) {
  const cellClass = (cell: Quantity) =>
    highlighted.includes(cell) ? "fill-blue-600 dark:fill-blue-400 font-bold" : "fill-zinc-700 dark:fill-zinc-200 font-semibold";

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-[220px] text-current">
          <polygon
            points={`${WIDTH / 2},10 20,155 ${WIDTH - 20},155`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.4}
          />
          <line x1={20} y1={100} x2={WIDTH - 20} y2={100} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />
          <line x1={WIDTH / 2} y1={100} x2={WIDTH / 2} y2={155} stroke="currentColor" strokeWidth={1.5} opacity={0.4} />

          <text x={WIDTH / 2} y={70} fontSize={16} textAnchor="middle" className={cellClass("voltage")}>
            {voltageText}
          </text>
          <text x={WIDTH / 2 - 60} y={135} fontSize={16} textAnchor="middle" className={cellClass("current")}>
            {currentText}
          </text>
          <text x={WIDTH / 2 + 60} y={135} fontSize={16} textAnchor="middle" className={cellClass("resistance")}>
            {resistanceText}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
