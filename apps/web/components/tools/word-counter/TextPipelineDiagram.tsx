type TextPipelineDiagramProps = {
  rawTextLabel: string;
  tokenizeLabel: string;
  countsLabel: string;
  caption: string;
};

const WIDTH = 480;
const BOX_W = 130;
const BOX_H = 60;
const Y = 30;
const HEIGHT = Y + BOX_H + 20;

function Box({ x, label }: { x: number; label: string }) {
  const lines = label.split("\n");
  const lineHeight = 13;
  const startY = Y + BOX_H / 2 - ((lines.length - 1) * lineHeight) / 2 + 4;

  return (
    <g>
      <rect x={x} y={Y} width={BOX_W} height={BOX_H} rx={8} fill="currentColor" opacity={0.1} stroke="currentColor" strokeWidth={1} />
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + BOX_W / 2}
          y={startY + i * lineHeight}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="currentColor"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export default function TextPipelineDiagram({
  rawTextLabel,
  tokenizeLabel,
  countsLabel,
  caption,
}: TextPipelineDiagramProps) {
  const gap = (WIDTH - BOX_W * 3) / 4;
  const x1 = gap;
  const x2 = gap * 2 + BOX_W;
  const x3 = gap * 3 + BOX_W * 2;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 420 }}>
          <defs>
            <marker id="pipeline-arrow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" opacity={0.8} />
            </marker>
          </defs>
          <Box x={x1} label={rawTextLabel} />
          <line
            x1={x1 + BOX_W}
            y1={Y + BOX_H / 2}
            x2={x2 - 4}
            y2={Y + BOX_H / 2}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.8}
            markerEnd="url(#pipeline-arrow)"
          />
          <Box x={x2} label={tokenizeLabel} />
          <line
            x1={x2 + BOX_W}
            y1={Y + BOX_H / 2}
            x2={x3 - 4}
            y2={Y + BOX_H / 2}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.8}
            markerEnd="url(#pipeline-arrow)"
          />
          <Box x={x3} label={countsLabel} />
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
