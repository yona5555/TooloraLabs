type LossyLosslessDiagramProps = {
  losslessLabel: string;
  lossyLabel: string;
  originalLabel: string;
  compressedLabel: string;
  resultLabel: string;
  identicalLabel: string;
  approximateLabel: string;
  caption: string;
};

const WIDTH = 480;
const ROW_H = 104;
const HEIGHT = 224;
const BOX_W = 88;
const BOX_H = 40;

function Row({
  y,
  rowLabel,
  originalLabel,
  compressedLabel,
  resultLabel,
  noteLabel,
  compressedOpacity,
  resultOpacity,
}: {
  y: number;
  rowLabel: string;
  originalLabel: string;
  compressedLabel: string;
  resultLabel: string;
  noteLabel: string;
  compressedOpacity: number;
  resultOpacity: number;
}) {
  const boxY = y + 20;
  const xs = [10, 196, 382];
  const labelY = boxY + BOX_H + 16;

  return (
    <g>
      <text x={0} y={y + 2} fontSize={12} fontWeight={700} fill="currentColor">
        {rowLabel}
      </text>

      <rect x={xs[0]} y={boxY} width={BOX_W} height={BOX_H} rx={6} fill="none" stroke="currentColor" strokeWidth={1.5} />
      <text x={xs[0] + BOX_W / 2} y={labelY} textAnchor="middle" fontSize={10.5} fill="currentColor">
        {originalLabel}
      </text>

      <path
        d={`M ${xs[0] + BOX_W + 6} ${boxY + BOX_H / 2} L ${xs[1] - 6} ${boxY + BOX_H / 2}`}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.5}
        markerEnd="url(#arrow)"
      />

      <rect x={xs[1]} y={boxY} width={BOX_W} height={BOX_H} rx={6} fill="currentColor" opacity={compressedOpacity} stroke="currentColor" strokeWidth={1} />
      <text x={xs[1] + BOX_W / 2} y={labelY} textAnchor="middle" fontSize={10.5} fill="currentColor">
        {compressedLabel}
      </text>

      <path
        d={`M ${xs[1] + BOX_W + 6} ${boxY + BOX_H / 2} L ${xs[2] - 6} ${boxY + BOX_H / 2}`}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.5}
        markerEnd="url(#arrow)"
      />

      <rect x={xs[2]} y={boxY} width={BOX_W} height={BOX_H} rx={6} fill="currentColor" opacity={resultOpacity} stroke="currentColor" strokeWidth={1} />
      <text x={xs[2] + BOX_W / 2} y={labelY} textAnchor="middle" fontSize={10.5} fill="currentColor">
        {resultLabel}
      </text>

      <text x={xs[2] + BOX_W / 2} y={labelY + 16} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
        {noteLabel}
      </text>
    </g>
  );
}

export default function LossyLosslessDiagram({
  losslessLabel,
  lossyLabel,
  originalLabel,
  compressedLabel,
  resultLabel,
  identicalLabel,
  approximateLabel,
  caption,
}: LossyLosslessDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 420 }}>
          <defs>
            <marker id="arrow" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity={0.6} />
            </marker>
          </defs>
          <Row
            y={14}
            rowLabel={losslessLabel}
            originalLabel={originalLabel}
            compressedLabel={compressedLabel}
            resultLabel={resultLabel}
            noteLabel={identicalLabel}
            compressedOpacity={0.15}
            resultOpacity={0.15}
          />
          <Row
            y={14 + ROW_H}
            rowLabel={lossyLabel}
            originalLabel={originalLabel}
            compressedLabel={compressedLabel}
            resultLabel={resultLabel}
            noteLabel={approximateLabel}
            compressedOpacity={0.55}
            resultOpacity={0.35}
          />
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
