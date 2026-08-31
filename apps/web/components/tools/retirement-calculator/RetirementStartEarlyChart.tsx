"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Static illustrative chart for the education intro — not tied to the user's live inputs (unlike
 * the above-fold result charts), since it's meant to make a single fixed point (starting decades
 * earlier dramatically outweighs total dollars contributed) rather than reflect whatever the
 * reader currently has typed into the calculator. Figures: $300/month at 7% annual return,
 * compounded monthly, from age 25 or age 35 to age 65.
 */
const SCENARIOS = [
  { key: "early", startAge: 25, years: 40, contributed: 144000, growth: 643444, total: 787444 },
  { key: "late", startAge: 35, years: 30, contributed: 108000, growth: 257991, total: 365991 },
] as const;

const MARGIN = { top: 28, left: 8, right: 8 };
const BAR_AREA_HEIGHT = 200;
const XAXIS_HEIGHT = 24;
const CHART_HEIGHT = MARGIN.top + BAR_AREA_HEIGHT + XAXIS_HEIGHT;
const CHART_WIDTH = 320;
const BAR_WIDTH = 88;
const GAP = 56;

export default function RetirementStartEarlyChart() {
  const t = useTranslations("tools.retirement-calculator.education.intro.diagram");
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const maxTotal = Math.max(...SCENARIOS.map((s) => s.total));
  const yForValue = (value: number) => MARGIN.top + BAR_AREA_HEIGHT - (value / maxTotal) * BAR_AREA_HEIGHT;
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
            const contributedTop = yForValue(s.contributed);
            const totalTop = yForValue(s.total);
            const dimmed = hoverKey !== null && hoverKey !== s.key;
            return (
              <g
                key={s.key}
                opacity={dimmed ? 0.5 : 1}
                onPointerEnter={() => setHoverKey(s.key)}
                onPointerLeave={() => setHoverKey(null)}
              >
                <rect x={x} y={contributedTop} width={BAR_WIDTH} height={Math.max(barBottom - contributedTop, 0)} className="fill-blue-600 dark:fill-blue-400" />
                <rect x={x} y={totalTop} width={BAR_WIDTH} height={Math.max(contributedTop - totalTop, 0)} className="fill-amber-400 dark:fill-amber-500" />
                <text x={x + BAR_WIDTH / 2} y={totalTop - 8} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-50">
                  {money(s.total)}
                </text>
                <text x={x + BAR_WIDTH / 2} y={barBottom + XAXIS_HEIGHT - 8} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
                  {t("ageLabel", { age: s.startAge })}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          {t("contributedLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500" />
          {t("growthLabel")}
        </span>
      </div>

      <figcaption className="mt-2 text-center text-sm opacity-70">{t("caption")}</figcaption>
    </figure>
  );
}
