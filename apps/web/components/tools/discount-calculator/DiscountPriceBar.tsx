import { svgPx } from "@/components/tool-ui/svgPx";
type DiscountPriceBarProps = {
  originalPrice: number;
  finalPrice: number;
  finalLabel: string;
  savedLabel: string;
  finalFormatted: string;
  savedFormatted: string;
};

const WIDTH = 320;
const BAR_HEIGHT = 32;
const HEIGHT = BAR_HEIGHT + 22;

export default function DiscountPriceBar({
  originalPrice,
  finalPrice,
  finalLabel,
  savedLabel,
  finalFormatted,
  savedFormatted,
}: DiscountPriceBarProps) {
  const safeOriginal = Math.max(originalPrice, 0.01);
  const finalWidth = Math.min(Math.max((finalPrice / safeOriginal) * WIDTH, 2), WIDTH);
  const savedWidth = WIDTH - finalWidth;

  return (
    <figure className="my-1">
      <div dir="ltr" className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`${finalLabel}: ${finalFormatted}, ${savedLabel}: ${savedFormatted}`}
          className="h-auto w-full text-current"
          style={{ minWidth: 260 }}
        >
          <rect x={0} y={0} width={WIDTH} height={BAR_HEIGHT} rx={6} className="fill-zinc-100 dark:fill-zinc-800" />
          <rect x={0} y={0} width={finalWidth} height={BAR_HEIGHT} rx={6} className="fill-blue-600 dark:fill-blue-400" />
          {savedWidth > 40 && (
            <text style={{ fontSize: svgPx(12) }} x={finalWidth + savedWidth / 2} y={BAR_HEIGHT / 2 + 4} textAnchor="middle" fontWeight={700} className="fill-zinc-600 dark:fill-zinc-300">
              −{savedFormatted}
            </text>
          )}
          {finalWidth > 50 && (
            <text style={{ fontSize: svgPx(12) }} x={10} y={BAR_HEIGHT / 2 + 4} fontWeight={700} className="fill-white">
              {finalFormatted}
            </text>
          )}

          <text style={{ fontSize: svgPx(12) }} x={0} y={BAR_HEIGHT + 16} className="fill-zinc-500 dark:fill-zinc-400">
            {finalLabel}
          </text>
          <text style={{ fontSize: svgPx(12) }} x={WIDTH} y={BAR_HEIGHT + 16} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
            {savedLabel}
          </text>
        </svg>
      </div>
    </figure>
  );
}
