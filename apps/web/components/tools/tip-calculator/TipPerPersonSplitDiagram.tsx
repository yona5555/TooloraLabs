"use client";
import { useMeasuredWidth } from "@/components/tool-ui/useMeasuredWidth";
import { svgPx } from "@/components/tool-ui/svgPx";

type TipPerPersonSplitDiagramProps = {
  people: number;
  amountPerPerson: number;
  formatValue: (value: number) => string;
  caption: string;
};

const ROW_HEIGHT = 28;
const ROW_GAP = 8;
const LABEL_WIDTH = 64;
const MARGIN_TOP = 6;
const MAX_ROWS = 8;

export default function TipPerPersonSplitDiagram({ people, amountPerPerson, formatValue, caption }: TipPerPersonSplitDiagramProps) {
  const [wrap, WIDTH] = useMeasuredWidth(320);
  const rows = Math.min(Math.max(Math.round(people), 1), MAX_ROWS);
  const overflow = Math.round(people) > MAX_ROWS;
  const height = MARGIN_TOP * 2 + rows * ROW_HEIGHT + (rows - 1) * ROW_GAP;
  const barMaxWidth = WIDTH - LABEL_WIDTH - 8;

  return (
    <figure className="my-2">
      <div ref={wrap} dir="ltr" className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} width={WIDTH} height={height} role="img" aria-label={caption} className="block h-auto w-full text-current" style={{ minWidth: 260 }}>
          {Array.from({ length: rows }, (_, i) => {
            const y = MARGIN_TOP + i * (ROW_HEIGHT + ROW_GAP);
            return (
              <g key={i}>
                <text style={{ fontSize: svgPx(12) }} x={LABEL_WIDTH - 8} y={y + ROW_HEIGHT / 2} textAnchor="end" dominantBaseline="middle" fill="currentColor" opacity={0.75}>
                  {`#${i + 1}`}
                </text>
                <rect x={LABEL_WIDTH} y={y} width={barMaxWidth} height={ROW_HEIGHT} rx={4} fill="currentColor" opacity={0.15} />
                <rect x={LABEL_WIDTH} y={y} width={barMaxWidth} height={ROW_HEIGHT} rx={4} className="fill-blue-600 dark:fill-blue-400" />
                <text style={{ fontSize: svgPx(12) }} x={LABEL_WIDTH + 10} y={y + ROW_HEIGHT / 2} dominantBaseline="middle" fontWeight={700} className="fill-white">
                  {formatValue(amountPerPerson)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">
        {caption}
        {overflow ? ` (+${Math.round(people) - MAX_ROWS})` : ""}
      </figcaption>
    </figure>
  );
}
