import type { DensityOperation } from "./types";

type DensityFormulaTriangleDiagramProps = {
  operation: DensityOperation;
  massLabel: string;
  densityLabel: string;
  volumeLabel: string;
  caption: string;
};

const CX = 110;
const TOP_Y = 10;
const MASS_CY = 45;
const MASS_R = 24;
const BASE_CY = 118;
const BASE_R = 22;
const HALF_WIDTH = 92;

/**
 * The classic "cover the unknown" mnemonic triangle: mass sits above the
 * divider, density and volume sit side by side below it. Live values from
 * the current form fields are printed beneath each circle (not just the
 * letter) so the diagram updates as the visitor types, not only when the
 * operation tab changes.
 */
export default function DensityFormulaTriangleDiagram({ operation, massLabel, densityLabel, volumeLabel, caption }: DensityFormulaTriangleDiagramProps) {
  const solved = { solveDensity: "density", solveMass: "mass", solveVolume: "volume" }[operation];

  const fillFor = (key: string) => (key === solved ? "url(#density-triangle-active)" : "url(#density-triangle-idle)");
  const textClass = (key: string) => (key === solved ? "fill-white font-bold" : "fill-zinc-700 dark:fill-zinc-200 font-semibold");
  const valueClass = (key: string) => (key === solved ? "fill-blue-600 dark:fill-blue-400 font-bold" : "fill-zinc-500 dark:fill-zinc-400");

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center">
        <svg viewBox="0 0 220 170" role="img" aria-label={caption} className="h-auto w-full max-w-[240px] text-current">
          <defs>
            <radialGradient id="density-triangle-active" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </radialGradient>
            <radialGradient id="density-triangle-idle" cx="35%" cy="35%">
              <stop offset="0%" className="[stop-color:#e4e4e7] dark:[stop-color:#52525b]" />
              <stop offset="100%" className="[stop-color:#a1a1aa] dark:[stop-color:#3f3f46]" />
            </radialGradient>
          </defs>

          <polygon
            points={`${CX},${TOP_Y} ${CX - HALF_WIDTH},${BASE_CY} ${CX + HALF_WIDTH},${BASE_CY}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.3}
          />
          <line x1={CX - HALF_WIDTH * 0.4} y1={80} x2={CX + HALF_WIDTH * 0.4} y2={80} stroke="currentColor" strokeWidth={1.5} opacity={0.3} />
          <line x1={CX} y1={80} x2={CX} y2={BASE_CY} stroke="currentColor" strokeWidth={1.5} opacity={0.3} />

          <g className="transition-opacity duration-200 hover:opacity-80">
            <circle cx={CX} cy={MASS_CY} r={MASS_R} fill={fillFor("mass")} />
            <text x={CX} y={MASS_CY + 5} textAnchor="middle" fontSize={14} className={textClass("mass")}>
              M
            </text>
          </g>
          <text x={CX} y={MASS_CY + MASS_R + 18} textAnchor="middle" fontSize={11} className={valueClass("mass")}>
            {massLabel}
          </text>

          <g className="transition-opacity duration-200 hover:opacity-80">
            <circle cx={CX - 40} cy={BASE_CY} r={BASE_R} fill={fillFor("density")} />
            <text x={CX - 40} y={BASE_CY + 5} textAnchor="middle" fontSize={13} className={textClass("density")}>
              D
            </text>
          </g>
          <text x={CX - 40} y={BASE_CY + BASE_R + 18} textAnchor="middle" fontSize={11} className={valueClass("density")}>
            {densityLabel}
          </text>

          <g className="transition-opacity duration-200 hover:opacity-80">
            <circle cx={CX + 40} cy={BASE_CY} r={BASE_R} fill={fillFor("volume")} />
            <text x={CX + 40} y={BASE_CY + 5} textAnchor="middle" fontSize={13} className={textClass("volume")}>
              V
            </text>
          </g>
          <text x={CX + 40} y={BASE_CY + BASE_R + 18} textAnchor="middle" fontSize={11} className={valueClass("volume")}>
            {volumeLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-xs opacity-70">{caption}</figcaption>
    </figure>
  );
}
