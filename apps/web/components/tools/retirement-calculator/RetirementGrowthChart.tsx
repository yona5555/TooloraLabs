"use client";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { YearlyGrowthPoint } from "@tooloralabs/tools";
import { computeNiceTicks } from "./niceTicks";

type RetirementGrowthChartProps = {
  hasCalculated: boolean;
  yearlySchedule: YearlyGrowthPoint[];
  currentSavings: number;
  totalContributions: number;
  totalGrowth: number;
  digitStyle: DigitStyle;
};

const MARGIN = { top: 30, left: 56, right: 16 };
const MAIN_HEIGHT = 170;
const VOLUME_GAP = 18;
const VOLUME_HEIGHT = 40;
const XAXIS_HEIGHT = 20;
const CHART_HEIGHT = MARGIN.top + MAIN_HEIGHT + VOLUME_GAP + VOLUME_HEIGHT + XAXIS_HEIGHT;

const MIN_STEP = 22;
const BAR_WIDTH_RATIO = 14 / 22;
const TOOLTIP_WIDTH = 168;
const TOOLTIP_HEIGHT = 78;
/** Beyond this many years, only every Nth x-axis label is drawn so they don't overlap. */
const MAX_DENSE_LABELS = 40;

export default function RetirementGrowthChart({ hasCalculated, yearlySchedule, currentSavings, totalContributions, totalGrowth, digitStyle }: RetirementGrowthChartProps) {
  const t = useTranslations("tools.retirement-calculator");
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

  if (!hasCalculated || yearlySchedule.length === 0) {
    return (
      <SectionCard title={t("growthChart.title")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("growthChart.emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  const rawMaxBalance = Math.max(...yearlySchedule.map((row) => row.balance), 1);
  const maxYearlyInterest = Math.max(...yearlySchedule.map((row) => row.yearlyInterest), 1);
  const step = Math.max(MIN_STEP, (containerWidth - MARGIN.left - MARGIN.right) / yearlySchedule.length);
  const barWidth = step * BAR_WIDTH_RATIO;
  const plotWidth = yearlySchedule.length * step;
  const chartWidth = MARGIN.left + plotWidth + MARGIN.right;

  const valueTicks = computeNiceTicks(rawMaxBalance);
  const maxBalance = valueTicks[valueTicks.length - 1];

  const mainBottom = MARGIN.top + MAIN_HEIGHT;
  const yForValue = (value: number) => mainBottom - (value / maxBalance) * MAIN_HEIGHT;

  const volumeTop = mainBottom + VOLUME_GAP;
  const volumeBottom = volumeTop + VOLUME_HEIGHT;
  const yForVolume = (value: number) => volumeBottom - (Math.max(value, 0) / maxYearlyInterest) * VOLUME_HEIGHT;

  const barX = (i: number) => MARGIN.left + i * step;
  const barCenterX = (i: number) => barX(i) + barWidth / 2;

  const currency = (value: number) => {
    const useCompact = Math.abs(value) >= 100_000;
    return formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency: "USD",
      notation: useCompact ? "compact" : "standard",
      maximumFractionDigits: useCompact ? 1 : 0,
    });
  };

  const activeIndex = hoverIndex;
  const active = activeIndex !== null ? yearlySchedule[activeIndex] : null;

  function updateHoverFromClientX(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * chartWidth;
    const index = Math.round((localX - MARGIN.left - barWidth / 2) / step);
    setHoverIndex(Math.min(Math.max(index, 0), yearlySchedule.length - 1));
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    updateHoverFromClientX(e.clientX);
  }

  const tooltipX = active
    ? Math.min(Math.max(barCenterX(activeIndex as number) - TOOLTIP_WIDTH / 2, MARGIN.left), chartWidth - MARGIN.right - TOOLTIP_WIDTH)
    : 0;
  const tooltipY = MARGIN.top + 4;

  const labelEvery = Math.max(1, Math.ceil(yearlySchedule.length / MAX_DENSE_LABELS));

  return (
    <SectionCard title={t("growthChart.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("growthChart.intro")}</p>

      <div ref={containerRef} dir="ltr" className="mt-4 overflow-x-auto">
        <svg
          ref={svgRef}
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          role="img"
          aria-label={t("growthChart.title")}
          className="block touch-none text-current select-none"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {valueTicks.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} y1={yForValue(tick)} x2={chartWidth - MARGIN.right} y2={yForValue(tick)} stroke="currentColor" strokeWidth={1} opacity={0.08} />
              <text x={MARGIN.left - 8} y={yForValue(tick) + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.6}>
                {currency(tick)}
              </text>
            </g>
          ))}
          <line x1={MARGIN.left} y1={mainBottom} x2={chartWidth - MARGIN.right} y2={mainBottom} stroke="currentColor" strokeWidth={1} opacity={0.25} />

          {yearlySchedule.map((row, i) => {
            const contributed = currentSavings + row.contributions;
            const isLast = i === yearlySchedule.length - 1;
            return (
              <g key={row.year} opacity={hoverIndex === null || i === hoverIndex ? 1 : 0.4}>
                <rect x={barX(i)} y={yForValue(contributed)} width={barWidth} height={Math.max(mainBottom - yForValue(contributed), 0)} className="fill-blue-600 dark:fill-blue-400" />
                <rect x={barX(i)} y={yForValue(row.balance)} width={barWidth} height={Math.max(yForValue(contributed) - yForValue(row.balance), 0)} className="fill-amber-400 dark:fill-amber-500" />
                {isLast && (
                  <text x={barCenterX(i)} y={yForValue(row.balance) - 10} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-100">
                    {currency(row.balance)}
                  </text>
                )}
              </g>
            );
          })}

          <text x={MARGIN.left - 8} y={volumeTop + 8} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.5}>
            {t("growthChart.interestLabel")}
          </text>
          {yearlySchedule.map((row, i) => (
            <rect
              key={`vol-${row.year}`}
              x={barX(i)}
              y={yForVolume(row.yearlyInterest)}
              width={barWidth}
              height={Math.max(volumeBottom - yForVolume(row.yearlyInterest), 1)}
              rx={1}
              className="fill-amber-400/50 dark:fill-amber-500/50"
              opacity={hoverIndex === null || i === hoverIndex ? 1 : 0.4}
            />
          ))}
          <line x1={MARGIN.left} y1={volumeBottom} x2={chartWidth - MARGIN.right} y2={volumeBottom} stroke="currentColor" strokeWidth={1} opacity={0.15} />

          {yearlySchedule.map((row, i) =>
            i % labelEvery === 0 ? (
              <text key={`year-${row.year}`} x={barCenterX(i)} y={volumeBottom + XAXIS_HEIGHT - 6} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>
                {formatLocalizedNumber(row.year, digitStyle, { maximumFractionDigits: 0 })}
              </text>
            ) : null
          )}

          {active && activeIndex !== null && (
            <>
              <line x1={barCenterX(activeIndex)} y1={MARGIN.top} x2={barCenterX(activeIndex)} y2={volumeBottom} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.35} />
              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx={6} className="fill-white stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700" strokeWidth={1} />
                <text x={10} y={17} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {t("growthChart.tooltipYearLabel")} {formatLocalizedNumber(active.year, digitStyle, { maximumFractionDigits: 0 })}
                </text>
                <text x={10} y={35} fontSize={10} className="fill-blue-700 dark:fill-blue-400">
                  {t("growthChart.contributedLabel")}: {currency(currentSavings + active.contributions)}
                </text>
                <text x={10} y={50} fontSize={10} className="fill-amber-600 dark:fill-amber-500">
                  {t("growthChart.interestLabel")}: {currency(active.interest)}
                </text>
                <text x={10} y={67} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {t("growthChart.tooltipBalanceLabel")}: {currency(active.balance)}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          {t("growthChart.contributedLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500" />
          {t("growthChart.interestLabel")}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <span className="text-zinc-600 dark:text-zinc-300">
          {t("growthChart.totalContributedLabel")}:{" "}
          <strong dir="ltr" className="text-zinc-900 dark:text-zinc-100">
            {currency(currentSavings + totalContributions)}
          </strong>
        </span>
        <span className="text-zinc-600 dark:text-zinc-300">
          {t("growthChart.totalInterestLabel")}:{" "}
          <strong dir="ltr" className="text-zinc-900 dark:text-zinc-100">
            {currency(totalGrowth)}
          </strong>
        </span>
      </div>
    </SectionCard>
  );
}
