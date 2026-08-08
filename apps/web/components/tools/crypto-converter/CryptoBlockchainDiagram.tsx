type CryptoBlockchainDiagramProps = {
  blockLabel: string;
  hashLabel: string;
  prevHashLabel: string;
  dataLabel: string;
  caption: string;
};

const BLOCKS = [
  { n: 1, hash: "4f2a…9e1c", prev: "0000…0000" },
  { n: 2, hash: "9c1d…7b3a", prev: "4f2a…9e1c" },
  { n: 3, hash: "2e8f…4d6b", prev: "9c1d…7b3a" },
  { n: 4, hash: "7a3c…1f9e", prev: "2e8f…4d6b" },
];

const BLOCK_WIDTH = 140;
const BLOCK_HEIGHT = 130;
const GAP = 40;
const TOP = 20;

export default function CryptoBlockchainDiagram({
  blockLabel,
  hashLabel,
  prevHashLabel,
  dataLabel,
  caption,
}: CryptoBlockchainDiagramProps) {
  const width = BLOCKS.length * BLOCK_WIDTH + (BLOCKS.length - 1) * GAP + 20;
  const height = TOP + BLOCK_HEIGHT + 40;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={caption}
          className="h-auto w-full text-current"
          style={{ minWidth: 560 }}
        >
          {BLOCKS.map((block, i) => {
            const x = 10 + i * (BLOCK_WIDTH + GAP);
            return (
              <g key={block.n}>
                <rect
                  x={x}
                  y={TOP}
                  width={BLOCK_WIDTH}
                  height={BLOCK_HEIGHT}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
                <text x={x + BLOCK_WIDTH / 2} y={TOP + 24} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">
                  {blockLabel} #{block.n}
                </text>
                <line x1={x + 12} y1={TOP + 36} x2={x + BLOCK_WIDTH - 12} y2={TOP + 36} stroke="currentColor" strokeWidth={0.75} opacity={0.5} />
                <text x={x + 12} y={TOP + 56} fontSize={10} fill="currentColor" opacity={0.85}>
                  {dataLabel}
                </text>
                <text x={x + 12} y={TOP + 80} fontSize={9.5} fontFamily="monospace" fill="currentColor">
                  {hashLabel}:
                </text>
                <text x={x + 12} y={TOP + 93} fontSize={9.5} fontFamily="monospace" fill="currentColor">
                  {block.hash}
                </text>
                <text x={x + 12} y={TOP + 112} fontSize={9.5} fontFamily="monospace" fill="currentColor" opacity={0.7}>
                  {prevHashLabel}:
                </text>
                <text x={x + 12} y={TOP + 125} fontSize={9.5} fontFamily="monospace" fill="currentColor" opacity={0.7}>
                  {block.prev}
                </text>

                {i < BLOCKS.length - 1 && (
                  <g>
                    <line
                      x1={x + BLOCK_WIDTH}
                      y1={TOP + BLOCK_HEIGHT / 2}
                      x2={x + BLOCK_WIDTH + GAP - 6}
                      y2={TOP + BLOCK_HEIGHT / 2}
                      stroke="currentColor"
                      strokeWidth={1.5}
                    />
                    <polygon
                      points={`${x + BLOCK_WIDTH + GAP - 6},${TOP + BLOCK_HEIGHT / 2 - 5} ${x + BLOCK_WIDTH + GAP + 4},${TOP + BLOCK_HEIGHT / 2} ${x + BLOCK_WIDTH + GAP - 6},${TOP + BLOCK_HEIGHT / 2 + 5}`}
                      fill="currentColor"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
