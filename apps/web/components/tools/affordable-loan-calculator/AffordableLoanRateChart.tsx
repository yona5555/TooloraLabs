"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Static illustrative chart for the education intro — not tied to the user's live inputs (unlike
 * the above-fold result charts), since it's meant to make a single fixed point (interest rate
 * materially changes borrowing power at a fixed payment) rather than reflect whatever the reader
 * currently has typed into the calculator. Figures: a $300/month payment over a 5-year (60-month)
 * term, at 5%, 8%, and 11% annual rates, via calculateAffordableLoan's present-value-of-an-annuity
 * formula.
 */
const SCENARIOS = [
  { key: "5", rate: 5, maxLoan: 15897 },
  { key: "8", rate: 8, maxLoan: 14796 },
  { key: "11", rate: 11, maxLoan: 13798 },
] as const;

const MARGIN = { top: 28, left: 8, right: 8 };
const BAR_AREA_HEIGHT = 200;
const XAXIS_HEIGHT = 24;
const CHART_HEIGHT = MARGIN.top + BAR_AREA_HEIGHT + XAXIS_HEIGHT;
const CHART_WIDTH = 320;
const BAR_WIDTH = 72;
const GAP = 44;

export default function AffordableLoanRateChart() {
  const t = useTranslations("tools.affordable-loan-calculator.education.intro.diagram");
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const maxValue = Math.max(...SCENARIOS.map((s) => s.maxLoan));
  const yForValue = (value: number) => MARGIN.top + BAR_AREA_HEIGHT - (value / maxValue) * BAR_AREA_HEIGHT;
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
            const top = yForValue(s.maxLoan);
            const dimmed = hoverKey !== null && hoverKey !== s.key;
            return (
              <g
                key={s.key}
                opacity={dimmed ? 0.5 : 1}
                onPointerEnter={() => setHoverKey(s.key)}
                onPointerLeave={() => setHoverKey(null)}
              >
                <rect x={x} y={top} width={BAR_WIDTH} height={Math.max(barBottom - top, 0)} className="fill-blue-600 dark:fill-blue-400" />
                <text x={x + BAR_WIDTH / 2} y={top - 8} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-50">
                  {money(s.maxLoan)}
                </text>
                <text x={x + BAR_WIDTH / 2} y={barBottom + XAXIS_HEIGHT - 8} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
                  {t("rateLabel", { rate: s.rate })}
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
