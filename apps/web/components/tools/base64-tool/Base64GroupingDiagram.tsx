type Base64GroupingDiagramProps = {
  byteLabel: string;
  sextetLabel: string;
  caption: string;
};

const WIDTH = 480;
const HEIGHT = 170;
const BYTE_W = 120;
const BYTE_H = 36;
const BYTE_Y = 20;
const SEXTET_W = 90;
const SEXTET_H = 36;
const SEXTET_Y = 110;

export default function Base64GroupingDiagram({ byteLabel, sextetLabel, caption }: Base64GroupingDiagramProps) {
  const byteGap = 4;
  const bytesStartX = (WIDTH - (BYTE_W * 3 + byteGap * 2)) / 2;

  const sextetGap = 4;
  const sextetsStartX = (WIDTH - (SEXTET_W * 4 + sextetGap * 3)) / 2;

  const byteXs = [0, 1, 2].map((i) => bytesStartX + i * (BYTE_W + byteGap));
  const sextetXs = [0, 1, 2, 3].map((i) => sextetsStartX + i * (SEXTET_W + sextetGap));

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 420 }}>
          {byteXs.map((x, i) => (
            <g key={i}>
              <rect x={x} y={BYTE_Y} width={BYTE_W} height={BYTE_H} rx={6} fill="currentColor" opacity={0.15} stroke="currentColor" strokeWidth={1} />
              <text x={x + BYTE_W / 2} y={BYTE_Y + BYTE_H / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
                {byteLabel} {i + 1} (8 bits)
              </text>
            </g>
          ))}

          {/* connecting lines from the 24-bit byte row down to the four 6-bit groups */}
          {sextetXs.map((x, i) => (
            <line
              key={i}
              x1={bytesStartX + ((BYTE_W * 3 + byteGap * 2) / 4) * (i + 0.5)}
              y1={BYTE_Y + BYTE_H}
              x2={x + SEXTET_W / 2}
              y2={SEXTET_Y}
              stroke="currentColor"
              strokeWidth={1}
              opacity={0.4}
            />
          ))}

          {sextetXs.map((x, i) => (
            <g key={i}>
              <rect x={x} y={SEXTET_Y} width={SEXTET_W} height={SEXTET_H} rx={6} fill="currentColor" opacity={0.75} stroke="currentColor" strokeWidth={1} />
              <text x={x + SEXTET_W / 2} y={SEXTET_Y + SEXTET_H / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--bg,#faf7ef)">
                {sextetLabel} {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
