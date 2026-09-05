type InvoiceBeforeAfterDiscountBarProps = {
  beforeLabel: string;
  afterLabel: string;
  beforeValue: number;
  afterValue: number;
  beforeFormatted: string;
  afterFormatted: string;
  caption: string;
};

const WIDTH = 320;
const BAR_HEIGHT = 28;
const ROW_GAP = 16;
const HEIGHT = BAR_HEIGHT * 2 + ROW_GAP + 4;

export default function InvoiceBeforeAfterDiscountBar({
  beforeLabel,
  afterLabel,
  beforeValue,
  afterValue,
  beforeFormatted,
  afterFormatted,
  caption,
}: InvoiceBeforeAfterDiscountBarProps) {
  const maxValue = Math.max(beforeValue, afterValue, 0.01);
  const beforeWidth = Math.max((beforeValue / maxValue) * WIDTH, 2);
  const afterWidth = Math.max((afterValue / maxValue) * WIDTH, 2);

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full text-current" style={{ minWidth: 280 }}>
          <g>
            <rect x={0} y={0} width={WIDTH} height={BAR_HEIGHT} rx={4} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.25} />
            <rect x={0} y={0} width={beforeWidth} height={BAR_HEIGHT} rx={4} className="fill-zinc-400 dark:fill-zinc-600" />
            <text x={8} y={BAR_HEIGHT / 2 + 4} fontSize={11} fontWeight={700} className="fill-white">
              {beforeLabel}
            </text>
            <text x={WIDTH - 8} y={BAR_HEIGHT / 2 + 4} textAnchor="end" fontSize={11} fontWeight={700} fill="currentColor">
              {beforeFormatted}
            </text>
          </g>
          <g>
            {(() => {
              const y = BAR_HEIGHT + ROW_GAP;
              return (
                <>
                  <rect x={0} y={y} width={WIDTH} height={BAR_HEIGHT} rx={4} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.25} />
                  <rect x={0} y={y} width={afterWidth} height={BAR_HEIGHT} rx={4} className="fill-blue-600 dark:fill-blue-400" />
                  <text x={8} y={y + BAR_HEIGHT / 2 + 4} fontSize={11} fontWeight={700} className="fill-white">
                    {afterLabel}
                  </text>
                  <text x={WIDTH - 8} y={y + BAR_HEIGHT / 2 + 4} textAnchor="end" fontSize={11} fontWeight={700} fill="currentColor">
                    {afterFormatted}
                  </text>
                </>
              );
            })()}
          </g>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
