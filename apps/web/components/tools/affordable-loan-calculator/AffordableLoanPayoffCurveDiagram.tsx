"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Static illustrative chart for the education intro — not tied to the user's live inputs (same
 * approach as AffordableLoanRateChart), since it makes a single fixed point (the outstanding
 * balance falls slowly at first, then faster, because early payments are mostly interest) rather
 * than reflecting whatever the reader currently has typed. Figures: a $20,000 loan at 6% annual
 * interest over a 5-year (60-month) term, via the standard amortizing-balance formula
 * B(k) = P(1+r)^k - M((1+r)^k - 1)/r, sampled at each year-end (r = monthly rate, M = monthly
 * payment from calculateAffordableLoan's own present-value-of-an-annuity relationship).
 */
const BALANCE_POINTS = [
  { year: 0, balance: 20000 },
  { year: 1, balance: 16464 },
  { year: 2, balance: 12710 },
  { year: 3, balance: 8724 },
  { year: 4, balance: 4493 },
  { year: 5, balance: 0 },
] as const;

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;
const MARGIN = { top: 12, right: 12, bottom: 24, left: 12 };
const PLOT_W = CHART_WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
const MAX_BALANCE = 20000;

function x(year: number) {
  return MARGIN.left + (year / 5) * PLOT_W;
}
function y(balance: number) {
  return MARGIN.top + PLOT_H - (balance / MAX_BALANCE) * PLOT_H;
}

export default function AffordableLoanPayoffCurveDiagram() {
  const t = useTranslations("tools.affordable-loan-calculator.education.intro.payoffDiagram");
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  const linePath = BALANCE_POINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year)} ${y(p.balance)}`).join(" ");
  const areaPath = `${linePath} L ${x(5)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

  return (
    <figure className="my-2">
      <div dir="ltr" className="mx-auto max-w-sm overflow-x-auto">
        <svg
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label={t("chartAriaLabel")}
          className="block text-current"
        >
          <line
            x1={MARGIN.left}
            y1={y(0)}
            x2={CHART_WIDTH - MARGIN.right}
            y2={y(0)}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.25}
          />
          <path d={areaPath} className="fill-blue-600/15 dark:fill-blue-400/15" />
          <path d={linePath} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={2.5} />
          {BALANCE_POINTS.map((p) => (
            <g
              key={p.year}
              onPointerEnter={() => setHoverYear(p.year)}
              onPointerLeave={() => setHoverYear(null)}
            >
              <circle cx={x(p.year)} cy={y(p.balance)} r={hoverYear === p.year ? 5 : 3.5} className="fill-blue-600 dark:fill-blue-400" />
              {hoverYear === p.year && (
                <text x={x(p.year)} y={y(p.balance) - 10} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-50">
                  {money(p.balance)}
                </text>
              )}
              <text x={x(p.year)} y={CHART_HEIGHT - 6} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
                {t("yearLabel", { year: p.year })}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{t("caption")}</figcaption>
    </figure>
  );
}
