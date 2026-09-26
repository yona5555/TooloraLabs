type InventoryPerItemCompositionBarProps = {
  items: { label: string; unitsSold: number; endingUnits: number }[];
  soldLabel: string;
  endingLabel: string;
  caption: string;
};

const MAX_ROWS = 6;

/**
 * Plain HTML stacked bars, one per item — each bar is a single continuous
 * two-segment fill (sold + ending), not bordered boxes linked by arrows.
 * Segment labels never render inside the fill (a short "endingUnits" bar
 * could be only a few pixels wide); the per-item total sits above instead.
 */
export default function InventoryPerItemCompositionBar({ items, soldLabel, endingLabel, caption }: InventoryPerItemCompositionBarProps) {
  const rows = items.slice(0, MAX_ROWS);
  const overflow = items.length - rows.length;

  return (
    <figure className="my-2">
      <div dir="ltr" className="space-y-3" role="img" aria-label={caption}>
        {rows.map((row, i) => {
          const total = Math.max(row.unitsSold + row.endingUnits, 1);
          const soldPct = (row.unitsSold / total) * 100;
          const endingPct = 100 - soldPct;
          return (
            <div key={i} className="text-sm">
              <p className="mb-1 truncate font-semibold text-zinc-700 dark:text-zinc-200">{row.label}</p>
              <div className="flex h-6 w-full overflow-hidden rounded-lg">
                <div className="flex items-center justify-center bg-zinc-400 text-[10px] font-bold text-white dark:bg-zinc-600" style={{ width: `${soldPct}%` }}>
                  {soldPct > 12 && row.unitsSold}
                </div>
                <div className="flex items-center justify-center bg-blue-600 text-[10px] font-bold text-white dark:bg-blue-400" style={{ width: `${endingPct}%` }}>
                  {endingPct > 12 && row.endingUnits}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          {soldLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          {endingLabel}
        </span>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">
        {caption}
        {overflow > 0 ? ` (+${overflow})` : ""}
      </figcaption>
    </figure>
  );
}
