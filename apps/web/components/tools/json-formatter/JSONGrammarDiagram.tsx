type JSONGrammarDiagramProps = {
  valueLabel: string;
  caption: string;
};

const TYPES = ["{ }", "[ ]", '" "', "123", "t/f", "null"];

const WIDTH = 460;
const HEIGHT = 150;
const BOX_W = 64;
const BOX_H = 32;
const TOP_Y = 10;
const BOTTOM_Y = 108;

export default function JSONGrammarDiagram({ valueLabel, caption }: JSONGrammarDiagramProps) {
  const gap = (WIDTH - TYPES.length * BOX_W) / (TYPES.length + 1);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 380 }}>
          <rect x={WIDTH / 2 - 50} y={TOP_Y} width={100} height={BOX_H} rx={6} fill="none" stroke="currentColor" strokeWidth={1.5} />
          <text x={WIDTH / 2} y={TOP_Y + BOX_H / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
            {valueLabel}
          </text>

          {TYPES.map((type, i) => {
            const x = gap + i * (BOX_W + gap);
            const centerX = x + BOX_W / 2;
            return (
              <g key={type}>
                <path
                  d={`M ${WIDTH / 2} ${TOP_Y + BOX_H} C ${WIDTH / 2} ${(TOP_Y + BOX_H + BOTTOM_Y) / 2}, ${centerX} ${(TOP_Y + BOX_H + BOTTOM_Y) / 2}, ${centerX} ${BOTTOM_Y}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  opacity={0.45}
                />
                <rect x={x} y={BOTTOM_Y} width={BOX_W} height={BOX_H} rx={6} fill="currentColor" opacity={0.12} stroke="currentColor" strokeWidth={1} />
                <text x={centerX} y={BOTTOM_Y + BOX_H / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">
                  {type}
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
