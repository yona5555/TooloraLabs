type CircleAnatomyDiagramProps = {
  radiusLabel: string;
  diameterLabel: string;
  circumferenceLabel: string;
  caption: string;
};

const SIZE = 220;
const CX = 110;
const CY = 110;
const R = 70;

export default function CircleAnatomyDiagram({ radiusLabel, diameterLabel, circumferenceLabel, caption }: CircleAnatomyDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={caption} className="h-auto w-56 text-current" style={{ minWidth: 200 }}>
          <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth={2} className="stroke-blue-600 dark:stroke-blue-400" />
          <line x1={CX} y1={CY} x2={CX + R} y2={CY} strokeWidth={2} className="stroke-emerald-500 dark:stroke-emerald-400" />
          <circle cx={CX} cy={CY} r={2.5} fill="currentColor" />
          <text x={CX + R / 2} y={CY - 8} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-emerald-600 dark:fill-emerald-400">
            {radiusLabel}
          </text>
          <line x1={CX - R} y1={CY + R + 20} x2={CX + R} y2={CY + R + 20} strokeWidth={2} className="stroke-purple-500 dark:stroke-purple-400" />
          <text x={CX} y={CY + R + 36} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-purple-600 dark:fill-purple-400">
            {diameterLabel}
          </text>
          <text x={CX} y={20} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-blue-600 dark:fill-blue-400">
            {circumferenceLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
