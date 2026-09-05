type InventoryPerItemCompositionBarProps = {
  items: { label: string; unitsSold: number; endingUnits: number }[];
  soldLabel: string;
  endingLabel: string;
  caption: string;
};

const WIDTH = 320;
const ROW_HEIGHT = 30;
const ROW_GAP = 22;
const LABEL_HEIGHT = 14;
const MAX_ROWS = 6;

export default function InventoryPerItemCompositionBar({ items, soldLabel, endingLabel, caption }: InventoryPerItemCompositionBarProps) {
  const rows = items.slice(0, MAX_ROWS);
  const overflow = items.length - rows.length;
  const height = rows.length * (ROW_HEIGHT + ROW_GAP + LABEL_HEIGHT) - ROW_GAP;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 280 }}>
          {rows.map((row, i) => {
            const total = Math.max(row.unitsSold + row.endingUnits, 1);
            const soldWidth = (row.unitsSold / total) * WIDTH;
            const endingWidth = WIDTH - soldWidth;
            const y = i * (ROW_HEIGHT + ROW_GAP + LABEL_HEIGHT) + LABEL_HEIGHT;
            return (
              <g key={i}>
                <text x={0} y={y - 4} fontSize={11} fontWeight={700} fill="currentColor">
                  {row.label.length > 24 ? `${row.label.slice(0, 23)}…` : row.label}
                </text>
                <rect x={0} y={y} width={soldWidth} height={ROW_HEIGHT} rx={4} className="fill-zinc-400 dark:fill-zinc-600" />
                <rect x={soldWidth} y={y} width={endingWidth} height={ROW_HEIGHT} rx={4} className="fill-blue-600 dark:fill-blue-400" />
                {soldWidth > 40 && (
                  <text x={soldWidth / 2} y={y + ROW_HEIGHT / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-white">
                    {row.unitsSold}
                  </text>
                )}
                {endingWidth > 40 && (
                  <text x={soldWidth + endingWidth / 2} y={y + ROW_HEIGHT / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-white">
                    {row.endingUnits}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-1 flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />{soldLabel}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />{endingLabel}</span>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">
        {caption}
        {overflow > 0 ? ` (+${overflow})` : ""}
      </figcaption>
    </figure>
  );
}
