import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CurrencyCode } from "@/lib/currency";

type Point = { price: number; cost: number };

type FuelPriceSensitivityDiagramProps = {
  points: Point[];
  currentPrice: number;
  caption: string;
  xLabel: string;
  currency: CurrencyCode;
  digitStyle: DigitStyle;
};

const WIDTH = 320;
const HEIGHT = 160;
const MARGIN = { top: 14, right: 12, bottom: 26, left: 12 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

export default function FuelPriceSensitivityDiagram({ points, currentPrice, caption, xLabel, currency, digitStyle }: FuelPriceSensitivityDiagramProps) {
  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 2 });
  const minPrice = Math.min(...points.map((p) => p.price));
  const maxPrice = Math.max(...points.map((p) => p.price));
  const minCost = Math.min(...points.map((p) => p.cost));
  const maxCost = Math.max(...points.map((p) => p.cost), minCost + 1);

  const xAt = (price: number) => MARGIN.left + ((price - minPrice) / Math.max(maxPrice - minPrice, 1)) * PLOT_WIDTH;
  const yAt = (cost: number) => MARGIN.top + PLOT_HEIGHT - ((cost - minCost) / Math.max(maxCost - minCost, 1)) * PLOT_HEIGHT;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.price).toFixed(1)} ${yAt(p.cost).toFixed(1)}`).join(" ");
  const clampedCurrent = Math.min(Math.max(currentPrice, minPrice), maxPrice);
  const currentX = xAt(clampedCurrent);
  const nearest = points.reduce((closest, p) => (Math.abs(p.price - clampedCurrent) < Math.abs(closest.price - clampedCurrent) ? p : closest), points[0]);
  const currentY = yAt(nearest.cost);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-72 text-current" style={{ minWidth: 260 }}>
          <line x1={MARGIN.left} y1={MARGIN.top + PLOT_HEIGHT} x2={WIDTH - MARGIN.right} y2={MARGIN.top + PLOT_HEIGHT} stroke="currentColor" strokeWidth={1} opacity={0.3} />
          <path d={pathD} fill="none" strokeWidth={2.5} className="stroke-amber-600 dark:stroke-amber-400" />
          <line x1={currentX} y1={MARGIN.top} x2={currentX} y2={MARGIN.top + PLOT_HEIGHT} strokeWidth={1} strokeDasharray="3 3" stroke="currentColor" opacity={0.4} />
          <circle cx={currentX} cy={currentY} r={4} className="fill-amber-600 dark:fill-amber-400" />
          <text x={MARGIN.left} y={HEIGHT - 6} fontSize={10} fill="currentColor" opacity={0.6}>
            {money(minPrice)}
          </text>
          <text x={WIDTH - MARGIN.right} y={HEIGHT - 6} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>
            {money(maxPrice)}
          </text>
          <text x={WIDTH / 2} y={HEIGHT - 6} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.6}>
            {xLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
