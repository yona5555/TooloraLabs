import type { DensityOperation } from "./types";

type DensityFormulaTriangleDiagramProps = {
  operation: DensityOperation;
  massLabel: string;
  densityLabel: string;
  volumeLabel: string;
  caption: string;
};

const CX = 100;
const TOP_Y = 14;
const BOTTOM_Y = 96;
const HALF_WIDTH = 86;

/**
 * The classic "cover the unknown" mnemonic triangle: mass sits above the
 * divider, density and volume sit side by side below it — covering any one
 * cell reveals the other two combined the correct way (M / D or M / V, or
 * D x V). Highlighting follows the currently-selected operation so it
 * visually matches the fields the input panel is asking for.
 */
export default function DensityFormulaTriangleDiagram({ operation, massLabel, densityLabel, volumeLabel, caption }: DensityFormulaTriangleDiagramProps) {
  const solved = { solveDensity: "density", solveMass: "mass", solveVolume: "volume" }[operation];

  const cellClass = (key: string) => (key === solved ? "fill-blue-600 dark:fill-blue-400" : "fill-zinc-400 dark:fill-zinc-500");
  const textClass = (key: string) => (key === solved ? "fill-white font-bold" : "fill-zinc-700 dark:fill-zinc-200 font-semibold");

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center">
        <svg viewBox="0 0 200 110" role="img" aria-label={caption} className="h-auto w-full max-w-[220px] text-current">
          <polygon
            points={`${CX},${TOP_Y} ${CX - HALF_WIDTH},${BOTTOM_Y} ${CX + HALF_WIDTH},${BOTTOM_Y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.35}
          />
          <line x1={CX - HALF_WIDTH * 0.42} y1={55} x2={CX + HALF_WIDTH * 0.42} y2={55} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />
          <line x1={CX} y1={55} x2={CX} y2={BOTTOM_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />

          <circle cx={CX} cy={38} r={22} className={cellClass("mass")} />
          <text x={CX} y={43} textAnchor="middle" fontSize={13} className={textClass("mass")}>
            M
          </text>

          <circle cx={CX - 38} cy={80} r={20} className={cellClass("density")} />
          <text x={CX - 38} y={85} textAnchor="middle" fontSize={12} className={textClass("density")}>
            D
          </text>

          <circle cx={CX + 38} cy={80} r={20} className={cellClass("volume")} />
          <text x={CX + 38} y={85} textAnchor="middle" fontSize={12} className={textClass("volume")}>
            V
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-xs opacity-70">
        {caption}
        <br />
        <span className="opacity-70">
          M = {massLabel} · D = {densityLabel} · V = {volumeLabel}
        </span>
      </figcaption>
    </figure>
  );
}
