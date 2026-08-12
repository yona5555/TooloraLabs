type SalesTaxBreakdownBarProps = {
  price: number;
  taxAmount: number;
  priceLabel: string;
  taxLabel: string;
  priceFormatted: string;
  taxFormatted: string;
};

const WIDTH = 320;
const BAR_HEIGHT = 32;
const HEIGHT = BAR_HEIGHT + 22;

export default function SalesTaxBreakdownBar({
  price,
  taxAmount,
  priceLabel,
  taxLabel,
  priceFormatted,
  taxFormatted,
}: SalesTaxBreakdownBarProps) {
  const total = Math.max(price + taxAmount, 0.01);
  const priceWidth = Math.min(Math.max((price / total) * WIDTH, 2), WIDTH);
  const taxWidth = WIDTH - priceWidth;

  return (
    <figure className="my-1">
      <div dir="ltr" className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`${priceLabel}: ${priceFormatted}, ${taxLabel}: ${taxFormatted}`}
          className="h-auto w-full text-current"
          style={{ minWidth: 260 }}
        >
          <rect x={0} y={0} width={WIDTH} height={BAR_HEIGHT} rx={6} className="fill-zinc-100 dark:fill-zinc-800" />
          <rect x={0} y={0} width={priceWidth} height={BAR_HEIGHT} rx={6} className="fill-blue-600 dark:fill-blue-400" />
          <rect
            x={priceWidth}
            y={0}
            width={taxWidth}
            height={BAR_HEIGHT}
            className="fill-amber-500 dark:fill-amber-400"
          />
          {priceWidth > 50 && (
            <text x={10} y={BAR_HEIGHT / 2 + 4} fontSize={12} fontWeight={700} className="fill-white">
              {priceFormatted}
            </text>
          )}
          {taxWidth > 40 && (
            <text
              x={priceWidth + taxWidth / 2}
              y={BAR_HEIGHT / 2 + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              className="fill-white"
            >
              +{taxFormatted}
            </text>
          )}

          <text x={0} y={BAR_HEIGHT + 16} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {priceLabel}
          </text>
          <text x={WIDTH} y={BAR_HEIGHT + 16} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {taxLabel}
          </text>
        </svg>
      </div>
    </figure>
  );
}
