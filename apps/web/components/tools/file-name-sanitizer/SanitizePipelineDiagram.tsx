type SanitizePipelineDiagramProps = {
  rawLabel: string;
  normalizeLabel: string;
  checkLabel: string;
  safeLabel: string;
  caption: string;
};

const WIDTH = 480;
const BOX_W = 106;
const BOX_H = 56;
const Y = 20;
const HEIGHT = Y + BOX_H + 20;

function Box({ x, label, emphasized }: { x: number; label: string; emphasized?: boolean }) {
  const lines = label.split("\n");
  const lineHeight = 12;
  const startY = Y + BOX_H / 2 - ((lines.length - 1) * lineHeight) / 2 + 4;

  return (
    <g>
      <rect
        x={x}
        y={Y}
        width={BOX_W}
        height={BOX_H}
        rx={8}
        fill="currentColor"
        opacity={emphasized ? 0.85 : 0.12}
        stroke="currentColor"
        strokeWidth={1}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + BOX_W / 2}
          y={startY + i * lineHeight}
          textAnchor="middle"
          fontSize={10.5}
          fontWeight={700}
          fill={emphasized ? "var(--bg,#faf7ef)" : "currentColor"}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export default function SanitizePipelineDiagram({
  rawLabel,
  normalizeLabel,
  checkLabel,
  safeLabel,
  caption,
}: SanitizePipelineDiagramProps) {
  const gap = (WIDTH - BOX_W * 4) / 5;
  const xs = [gap, gap * 2 + BOX_W, gap * 3 + BOX_W * 2, gap * 4 + BOX_W * 3];
  const labels = [rawLabel, normalizeLabel, checkLabel, safeLabel];

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 420 }}>
          <defs>
            <marker id="sanitize-arrow" markerWidth={8} markerHeight={8} refX={4} refY={4} orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" opacity={0.8} />
            </marker>
          </defs>
          {xs.map((x, i) => (
            <g key={i}>
              {i > 0 && (
                <line
                  x1={xs[i - 1] + BOX_W}
                  y1={Y + BOX_H / 2}
                  x2={x - 4}
                  y2={Y + BOX_H / 2}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  opacity={0.8}
                  markerEnd="url(#sanitize-arrow)"
                />
              )}
              <Box x={x} label={labels[i]} emphasized={i === xs.length - 1} />
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
