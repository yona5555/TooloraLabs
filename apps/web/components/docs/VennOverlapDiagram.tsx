type VennOverlapDiagramProps = {
  leftLabel: string;
  rightLabel: string;
  overlapLabel: string;
  leftOnlyItems: string;
  overlapItems: string;
  rightOnlyItems: string;
  caption: string;
};

const WIDTH = 340;
const HEIGHT = 190;
const R = 85;
const CY = 80;
const LEFT_CX = WIDTH / 2 - 45;
const RIGHT_CX = WIDTH / 2 + 45;

export default function VennOverlapDiagram({
  leftLabel,
  rightLabel,
  overlapLabel,
  leftOnlyItems,
  overlapItems,
  rightOnlyItems,
  caption,
}: VennOverlapDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-80 text-current" style={{ minWidth: 280 }}>
          <circle cx={LEFT_CX} cy={CY} r={R} className="fill-blue-500 dark:fill-blue-400" opacity={0.35} />
          <circle cx={RIGHT_CX} cy={CY} r={R} className="fill-emerald-500 dark:fill-emerald-400" opacity={0.35} />

          <text x={LEFT_CX - 40} y={30} fontSize={11} fontWeight={700} fill="currentColor">
            {leftLabel}
          </text>
          <text x={RIGHT_CX + 10} y={30} fontSize={11} fontWeight={700} fill="currentColor">
            {rightLabel}
          </text>
          <text x={WIDTH / 2} y={CY - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="currentColor">
            {overlapLabel}
          </text>

          <text x={LEFT_CX - 40} y={CY + 8} fontSize={10} fill="currentColor" opacity={0.85}>
            {leftOnlyItems}
          </text>
          <text x={WIDTH / 2} y={CY + 12} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.85}>
            {overlapItems}
          </text>
          <text x={RIGHT_CX + 10} y={CY + 8} fontSize={10} fill="currentColor" opacity={0.85}>
            {rightOnlyItems}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
