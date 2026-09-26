import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { CurrencyCode } from "@/lib/currency";
import AutoFitText from "@/components/tool-ui/AutoFitText";

type Point = { price: number; cost: number };

type FuelPriceSensitivityDiagramProps = {
  lowPoint: Point;
  currentPoint: Point;
  highPoint: Point;
  caption: string;
  lowLabel: string;
  currentLabel: string;
  highLabel: string;
  currency: CurrencyCode;
  digitStyle: DigitStyle;
};

const WIDTH = 340;
const HEIGHT = 190;
const BAR_WIDTH = 64;
const GAP = 32;
const BASELINE_Y = 124;
const MAX_BAR_HEIGHT = 78;
const LOW_TONE = { barClass: "fill-amber-400/70 dark:fill-amber-500/60", textClass: "fill-amber-700 dark:fill-amber-300" };
const CURRENT_TONE = { barClass: "fill-blue-600 dark:fill-blue-400", textClass: "fill-blue-700 dark:fill-blue-300" };
const HIGH_TONE = { barClass: "fill-rose-400/70 dark:fill-rose-500/60", textClass: "fill-rose-700 dark:fill-rose-300" };

/**
 * Three concrete price -> cost scenarios (low/current/high — the caller
 * passes these explicitly, e.g. FuelResult.tsx's sensitivityPoints[0]/[2]/
 * [5], rather than this component guessing "the middle one" from an array
 * length, which is fragile to how many points the caller happens to pass)
 * as bars with both numbers permanently visible above each one — replaces
 * a bare line + one unlabeled dot that only conveyed "there's a linear
 * relationship" and made the reader infer actual numbers from the axes.
 * Every value here is read directly off the chart, no inference needed.
 */
export default function FuelPriceSensitivityDiagram({ lowPoint, currentPoint, highPoint, caption, lowLabel, currentLabel, highLabel, currency, digitStyle }: FuelPriceSensitivityDiagramProps) {
  const money = (value: number, maximumFractionDigits = 2) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits });

  const maxCost = Math.max(lowPoint.cost, currentPoint.cost, highPoint.cost, 1);

  const scenarios = [
    { key: "low", point: lowPoint, label: lowLabel, tone: LOW_TONE },
    { key: "current", point: currentPoint, label: currentLabel, tone: CURRENT_TONE },
    { key: "high", point: highPoint, label: highLabel, tone: HIGH_TONE },
  ];

  const totalBarsWidth = scenarios.length * BAR_WIDTH + (scenarios.length - 1) * GAP;
  const startX = (WIDTH - totalBarsWidth) / 2;
  const costSteps = ["text-base", "text-sm", "text-xs"];

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-[380px] text-current" style={{ minWidth: 300 }}>
          <line x1={16} y1={BASELINE_Y} x2={WIDTH - 16} y2={BASELINE_Y} stroke="currentColor" strokeWidth={1} opacity={0.25} />

          {scenarios.map((s, i) => {
            const x = startX + i * (BAR_WIDTH + GAP);
            const barHeight = Math.max((s.point.cost / maxCost) * MAX_BAR_HEIGHT, 6);
            const barY = BASELINE_Y - barHeight;
            const costText = money(s.point.cost, 0);

            return (
              <g key={s.key}>
                <rect x={x} y={barY} width={BAR_WIDTH} height={barHeight} rx={6} className={s.tone.barClass} />
                {/* foreignObject embeds a real HTML node inside the SVG, so
                    AutoFitText can measure its actual rendered width against
                    a real parent (this fixed-width div) instead of guessing
                    a font size from character count — same measured
                    shrink-to-fit as every other money value on this page,
                    not a one-off SVG-text-only heuristic. */}
                <foreignObject x={x - 14} y={Math.max(barY - 32, 2)} width={BAR_WIDTH + 28} height={28}>
                  <div dir="ltr" className="flex w-full justify-center">
                    <AutoFitText text={costText} steps={costSteps} allowWrap={false} className={`font-mono font-bold ${s.tone.textClass.replace("fill-", "text-")}`} />
                  </div>
                </foreignObject>
                <text x={x + BAR_WIDTH / 2} y={BASELINE_Y + 16} textAnchor="middle" fontSize={10} fontWeight={700} fill="currentColor">
                  {money(s.point.price)}
                </text>
                <text x={x + BAR_WIDTH / 2} y={BASELINE_Y + 30} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.65}>
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
