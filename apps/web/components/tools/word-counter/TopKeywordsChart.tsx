import type { KeywordCount } from "@tooloralabs/tools";

type TopKeywordsChartProps = {
  keywords: KeywordCount[];
  chartLabel: string;
};

const WIDTH = 320;
const BAR_HEIGHT = 24;
const GAP = 10;
const PAD = 6;
const LABEL_W = 96;

export default function TopKeywordsChart({ keywords, chartLabel }: TopKeywordsChartProps) {
  const max = Math.max(...keywords.map((k) => k.count), 1);
  const barAreaW = WIDTH - LABEL_W - PAD * 2;
  const height = PAD * 2 + keywords.length * (BAR_HEIGHT + GAP) - GAP;

  return (
    <div dir="ltr" className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={chartLabel}
        className="h-auto w-full text-current"
        style={{ minWidth: 260 }}
      >
        {keywords.map((row, i) => {
          const y = PAD + i * (BAR_HEIGHT + GAP);
          const w = (row.count / max) * barAreaW;
          return (
            <g key={row.word}>
              <text x={0} y={y + BAR_HEIGHT / 2 + 4} fontSize={11} fill="currentColor" style={{ unicodeBidi: "isolate" }}>
                {row.word}
              </text>
              <rect x={LABEL_W} y={y} width={barAreaW} height={BAR_HEIGHT} fill="currentColor" opacity={0.08} rx={4} />
              <rect x={LABEL_W} y={y} width={w} height={BAR_HEIGHT} fill="currentColor" opacity={0.75} rx={4} />
              <text
                x={LABEL_W + barAreaW - 4}
                y={y + BAR_HEIGHT / 2 + 4}
                textAnchor="end"
                fontSize={11}
                fontWeight={700}
                fill="currentColor"
                style={{ unicodeBidi: "bidi-override", direction: "ltr" }}
              >
                {row.count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
