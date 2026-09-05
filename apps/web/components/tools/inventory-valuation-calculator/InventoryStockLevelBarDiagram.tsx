type InventoryStockLevelBarDiagramProps = {
  items: { label: string; endingUnits: number; belowThreshold: boolean }[];
  caption: string;
};

const WIDTH = 320;
const ROW_HEIGHT = 26;
const ROW_GAP = 10;
const LABEL_WIDTH = 96;
const MARGIN_TOP = 6;
const MAX_ROWS = 8;

export default function InventoryStockLevelBarDiagram({ items, caption }: InventoryStockLevelBarDiagramProps) {
  const rows = items.slice(0, MAX_ROWS);
  const overflow = items.length - rows.length;
  const maxValue = Math.max(...rows.map((r) => r.endingUnits), 1);
  const height = MARGIN_TOP * 2 + rows.length * (ROW_HEIGHT + ROW_GAP) - ROW_GAP;
  const barMaxWidth = WIDTH - LABEL_WIDTH - 8;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 280 }}>
          {rows.map((row, i) => {
            const y = MARGIN_TOP + i * (ROW_HEIGHT + ROW_GAP);
            const width = Math.max((row.endingUnits / maxValue) * barMaxWidth, 2);
            return (
              <g key={i}>
                <text x={LABEL_WIDTH - 8} y={y + ROW_HEIGHT / 2 + 4} textAnchor="end" fontSize={10} fill="currentColor">
                  {row.label.length > 14 ? `${row.label.slice(0, 13)}…` : row.label}
                </text>
                <rect x={LABEL_WIDTH} y={y} width={width} height={ROW_HEIGHT} rx={4} className={row.belowThreshold ? "fill-amber-500 dark:fill-amber-400" : "fill-blue-600 dark:fill-blue-400"} />
                <text x={LABEL_WIDTH + width + 6} y={y + ROW_HEIGHT / 2 + 4} fontSize={10} fontWeight={700} fill="currentColor">
                  {row.endingUnits}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">
        {caption}
        {overflow > 0 ? ` (+${overflow})` : ""}
      </figcaption>
    </figure>
  );
}
