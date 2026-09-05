export type BreakdownSegment = { label: string; value: number; colorClass: string };

type Props = {
  segments: BreakdownSegment[];
  totalLabel: string;
  caption: string;
};

const WIDTH = 480;
const HEIGHT = 140;
const BAR_HEIGHT = 56;
const BAR_TOP = 30;

/**
 * A generic 2-to-4-segment stacked bar showing what a result's total is
 * actually made of — reused across every tool whose result decomposes into
 * named parts (principal/interest, taxes/insurance, etc.), each with its own
 * representative example values (not a visitor's live inputs, since this is
 * reference documentation illustrating the *shape* of a result).
 */
export default function BreakdownBarDiagram({ segments, totalLabel, caption }: Props) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;

  const { positioned } = segments.reduce<{ positioned: (BreakdownSegment & { width: number; x: number })[]; cursor: number }>(
    (acc, seg) => {
      const width = (seg.value / total) * WIDTH;
      return { positioned: [...acc.positioned, { ...seg, width, x: acc.cursor }], cursor: acc.cursor + width };
    },
    { positioned: [], cursor: 0 }
  );

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-lg">
          {positioned.map((seg) => (
            <rect key={seg.label} x={seg.x} y={BAR_TOP} width={seg.width} height={BAR_HEIGHT} className={seg.colorClass} />
          ))}
          <rect x={0} y={BAR_TOP} width={WIDTH} height={BAR_HEIGHT} rx={8} fill="none" stroke="currentColor" strokeWidth={1} className="text-zinc-300 dark:text-zinc-700" />

          {positioned.map((seg) => (
            <text key={`label-${seg.label}`} x={seg.x + seg.width / 2} y={BAR_TOP + BAR_HEIGHT / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-white">
              {seg.width > 60 ? seg.label : ""}
            </text>
          ))}

          <text x={WIDTH / 2} y={BAR_TOP - 10} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
            {totalLabel}
          </text>

          <g transform={`translate(0, ${BAR_TOP + BAR_HEIGHT + 24})`}>
            {segments.map((seg, i) => (
              <g key={seg.label} transform={`translate(${i * 150}, 0)`}>
                <rect width={10} height={10} rx={2} className={seg.colorClass} />
                <text x={16} y={9} fontSize={11} className="fill-zinc-600 dark:fill-zinc-300">
                  {seg.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
