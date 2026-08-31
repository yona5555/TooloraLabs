"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Static illustrative chart for the education intro — not tied to the user's live inputs (unlike
 * the above-fold result panel), since it's meant to make a single fixed point (your income sets
 * your home-buying ceiling under the 28/36 rule) rather than reflect whatever the reader currently
 * has typed into the calculator. Figures: $20,000 down payment, 6.5% annual rate, 30-year term,
 * 1.2% property tax rate, $1,200/year home insurance, no HOA, no other monthly debts — run through
 * `calculateHouseAffordability` in packages/tools/src/calculators/HouseAffordabilityCalculator.ts.
 */
const SCENARIOS = [
  { key: "income50k", income: 50000, maxPrice: 162974 },
  { key: "income75k", income: 75000, maxPrice: 242657 },
  { key: "income100k", income: 100000, maxPrice: 322340 },
  { key: "income150k", income: 150000, maxPrice: 481706 },
] as const;

const MARGIN = { top: 28, left: 8, right: 8 };
const BAR_AREA_HEIGHT = 200;
const XAXIS_HEIGHT = 24;
const CHART_HEIGHT = MARGIN.top + BAR_AREA_HEIGHT + XAXIS_HEIGHT;
const BAR_WIDTH = 56;
const GAP = 30;
const CHART_WIDTH = MARGIN.left + SCENARIOS.length * BAR_WIDTH + (SCENARIOS.length - 1) * GAP + MARGIN.right;

export default function HouseAffordabilityIncomeChart() {
  const t = useTranslations("tools.house-affordability-calculator.education.intro.diagram");
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const maxPrice = Math.max(...SCENARIOS.map((s) => s.maxPrice));
  const yForValue = (value: number) => MARGIN.top + BAR_AREA_HEIGHT - (value / maxPrice) * BAR_AREA_HEIGHT;
  const barBottom = MARGIN.top + BAR_AREA_HEIGHT;

  const groupX = (i: number) => MARGIN.left + i * (BAR_WIDTH + GAP);

  const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

  return (
    <figure className="my-2">
      <div dir="ltr" className="mx-auto max-w-sm overflow-x-auto">
        <svg width={CHART_WIDTH} height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label={t("chartAriaLabel")} className="block text-current">
          <line x1={0} y1={barBottom} x2={CHART_WIDTH} y2={barBottom} stroke="currentColor" strokeWidth={1} opacity={0.25} />
          {SCENARIOS.map((s, i) => {
            const x = groupX(i);
            const top = yForValue(s.maxPrice);
            const dimmed = hoverKey !== null && hoverKey !== s.key;
            return (
              <g
                key={s.key}
                opacity={dimmed ? 0.5 : 1}
                onPointerEnter={() => setHoverKey(s.key)}
                onPointerLeave={() => setHoverKey(null)}
              >
                <rect x={x} y={top} width={BAR_WIDTH} height={Math.max(barBottom - top, 0)} className="fill-blue-600 dark:fill-blue-400" />
                <text x={x + BAR_WIDTH / 2} y={top - 8} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-50">
                  {money(s.maxPrice)}
                </text>
                <text x={x + BAR_WIDTH / 2} y={barBottom + XAXIS_HEIGHT - 8} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
                  {t("incomeLabel", { income: s.income.toLocaleString("en-US") })}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <figcaption className="mt-2 text-center text-sm opacity-70">{t("caption")}</figcaption>
    </figure>
  );
}
