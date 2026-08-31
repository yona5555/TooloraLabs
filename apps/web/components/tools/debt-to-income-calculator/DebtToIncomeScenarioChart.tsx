"use client";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { DebtToIncomeResult as RatioResult } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { computeNiceTicks } from "./niceTicks";
import type { CurrencyCode } from "@/lib/currency";

type DebtToIncomeScenarioChartProps = {
  hasCalculated: boolean;
  before: RatioResult;
  after: RatioResult;
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

const CATEGORY_FILL: Record<string, string> = {
  healthy: "fill-green-500 dark:fill-green-400",
  manageable: "fill-amber-500 dark:fill-amber-400",
  high: "fill-orange-500 dark:fill-orange-400",
  veryHigh: "fill-red-500 dark:fill-red-400",
};

const CATEGORY_TEXT: Record<string, string> = {
  healthy: "fill-green-600 dark:fill-green-400",
  manageable: "fill-amber-600 dark:fill-amber-400",
  high: "fill-orange-600 dark:fill-orange-400",
  veryHigh: "fill-red-600 dark:fill-red-400",
};

const MARGIN = { top: 16, left: 48, right: 16 };
const MAIN_HEIGHT = 190;
const XAXIS_HEIGHT = 22;
const CHART_HEIGHT = MARGIN.top + MAIN_HEIGHT + XAXIS_HEIGHT;

const MIN_STEP = 140;
const BAR_WIDTH_RATIO = 0.42;
const TOOLTIP_WIDTH = 176;
const TOOLTIP_HEIGHT = 78;
const THRESHOLDS = [36, 43, 50];

export default function DebtToIncomeScenarioChart({ hasCalculated, before, after, digitStyle, currency }: DebtToIncomeScenarioChartProps) {
  const t = useTranslations("tools.debt-to-income-calculator");
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!hasCalculated) {
    return (
      <SectionCard title={t("scenarioChart.title")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("scenarioChart.emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  const points = [
    { key: "before" as const, label: t("scenarioChart.beforeLabel"), result: before },
    { key: "after" as const, label: t("scenarioChart.afterLabel"), result: after },
  ];

  const step = Math.max(MIN_STEP, (containerWidth - MARGIN.left - MARGIN.right) / points.length);
  const barWidth = step * BAR_WIDTH_RATIO;
  const plotWidth = points.length * step;
  const chartWidth = MARGIN.left + plotWidth + MARGIN.right;

  const rawMax = Math.max(before.backEndRatio, after.backEndRatio, THRESHOLDS[THRESHOLDS.length - 1]);
  const valueTicks = computeNiceTicks(rawMax);
  const maxValue = valueTicks[valueTicks.length - 1];

  const mainBottom = MARGIN.top + MAIN_HEIGHT;
  const yForValue = (value: number) => mainBottom - (value / maxValue) * MAIN_HEIGHT;

  const groupX = (i: number) => MARGIN.left + i * step;
  const groupCenterX = (i: number) => groupX(i) + step / 2;
  const barX = (i: number) => groupCenterX(i) - barWidth / 2;

  const percent = (value: number) => `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 })}%`;
  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency, maximumFractionDigits: 0 });

  const activeIndex = hoverIndex;
  const active = activeIndex !== null ? points[activeIndex] : null;

  function updateHoverFromClientX(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * chartWidth;
    const index = Math.floor((localX - MARGIN.left) / step);
    setHoverIndex(Math.min(Math.max(index, 0), points.length - 1));
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    updateHoverFromClientX(e.clientX);
  }

  const tooltipX = active
    ? Math.min(Math.max(groupCenterX(activeIndex as number) - TOOLTIP_WIDTH / 2, MARGIN.left), chartWidth - MARGIN.right - TOOLTIP_WIDTH)
    : 0;
  const tooltipY = MARGIN.top + 4;

  return (
    <SectionCard title={t("scenarioChart.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("scenarioChart.intro")}</p>

      <div ref={containerRef} dir="ltr" className="mt-4 overflow-x-auto">
        <svg
          ref={svgRef}
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          role="img"
          aria-label={t("scenarioChart.title")}
          className="block touch-none text-current select-none"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {valueTicks.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} y1={yForValue(tick)} x2={chartWidth - MARGIN.right} y2={yForValue(tick)} stroke="currentColor" strokeWidth={1} opacity={0.08} />
              <text x={MARGIN.left - 8} y={yForValue(tick) + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.6}>
                {formatLocalizedNumber(tick, digitStyle, { maximumFractionDigits: 0 })}%
              </text>
            </g>
          ))}

          {THRESHOLDS.filter((threshold) => threshold <= maxValue).map((threshold) => (
            <line
              key={threshold}
              x1={MARGIN.left}
              y1={yForValue(threshold)}
              x2={chartWidth - MARGIN.right}
              y2={yForValue(threshold)}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.25}
            />
          ))}

          <line x1={MARGIN.left} y1={mainBottom} x2={chartWidth - MARGIN.right} y2={mainBottom} stroke="currentColor" strokeWidth={1} opacity={0.25} />

          {points.map((p, i) => (
            <g key={p.key} opacity={hoverIndex === null || i === hoverIndex ? 1 : 0.5}>
              <rect
                x={barX(i)}
                y={yForValue(p.result.backEndRatio)}
                width={barWidth}
                height={Math.max(mainBottom - yForValue(p.result.backEndRatio), 0)}
                rx={3}
                className={CATEGORY_FILL[p.result.category]}
              />
              <text x={groupCenterX(i)} y={yForValue(p.result.backEndRatio) - 8} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-100">
                {percent(p.result.backEndRatio)}
              </text>
              <text x={groupCenterX(i)} y={mainBottom + XAXIS_HEIGHT - 6} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
                {p.label}
              </text>
            </g>
          ))}

          {active && activeIndex !== null && (
            <>
              <line x1={groupCenterX(activeIndex)} y1={MARGIN.top} x2={groupCenterX(activeIndex)} y2={mainBottom} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.35} />
              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx={6} className="fill-white stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700" strokeWidth={1} />
                <text x={10} y={17} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {active.label}
                </text>
                <text x={10} y={35} fontSize={10} className="fill-zinc-600 dark:fill-zinc-300">
                  {t("aboveFold.backEndRatioLabel")}: {percent(active.result.backEndRatio)}
                </text>
                <text x={10} y={50} fontSize={10} className="fill-zinc-600 dark:fill-zinc-300">
                  {t("aboveFold.totalMonthlyDebtLabel")}: {money(active.result.totalMonthlyDebt)}
                </text>
                <text x={10} y={67} fontSize={10} fontWeight={700} className={CATEGORY_TEXT[active.result.category]}>
                  {t(`aboveFold.category.${active.result.category}`)}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        {THRESHOLDS.map((threshold) => (
          <span key={threshold} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-current opacity-50" />
            {t("scenarioChart.thresholdLabel", { value: threshold })}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}
