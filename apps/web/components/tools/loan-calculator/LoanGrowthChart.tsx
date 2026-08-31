"use client";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { LoanGrowthRow } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { computeNiceTicks } from "./niceTicks";
import type { CurrencyCode } from "@/lib/currency";

type LoanGrowthChartProps = {
  schedule: LoanGrowthRow[];
  loanAmount: number;
  totalInterest: number;
  digitStyle: DigitStyle;
  currency: CurrencyCode;
  titleKey: "deferredGrowthChart" | "bondGrowthChart";
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

export default function LoanGrowthChart({ schedule, loanAmount, totalInterest, digitStyle, currency, titleKey }: LoanGrowthChartProps) {
  const t = useTranslations(`tools.loan-calculator.${titleKey}`);
  const tShared = useTranslations("tools.loan-calculator.payoffChart");
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

  if (schedule.length === 0) return null;

  const step = Math.max(MIN_STEP, (containerWidth - MARGIN.left - MARGIN.right) / schedule.length);
  const barWidth = step * BAR_WIDTH_RATIO;
  const plotWidth = schedule.length * step;
  const chartWidth = MARGIN.left + plotWidth + MARGIN.right;

  const rawMaxBalance = Math.max(...schedule.map((row) => row.endingBalance), 1);
  const valueTicks = computeNiceTicks(rawMaxBalance);
  const maxBalance = valueTicks[valueTicks.length - 1];
  const maxInterestAccrued = Math.max(...schedule.map((row) => row.interestAccrued), 1);

  const mainBottom = MARGIN.top + MAIN_HEIGHT;
  const yForValue = (value: number) => mainBottom - (value / maxBalance) * MAIN_HEIGHT;

  const volumeTop = mainBottom + VOLUME_GAP;
  const volumeBottom = volumeTop + VOLUME_HEIGHT;
  const yForVolume = (value: number) => volumeBottom - (Math.max(value, 0) / maxInterestAccrued) * VOLUME_HEIGHT;

  const barX = (i: number) => MARGIN.left + i * step;
  const barCenterX = (i: number) => barX(i) + barWidth / 2;

  const money = (value: number) => {
    const useCompact = Math.abs(value) >= 100_000;
    return formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency,
      notation: useCompact ? "compact" : "standard",
      maximumFractionDigits: useCompact ? 1 : 0,
    });
  };

  const activeIndex = hoverIndex;
  const active = activeIndex !== null ? schedule[activeIndex] : null;

  function updateHoverFromClientX(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * chartWidth;
    const index = Math.round((localX - MARGIN.left - barWidth / 2) / step);
    setHoverIndex(Math.min(Math.max(index, 0), schedule.length - 1));
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    updateHoverFromClientX(e.clientX);
  }

  const tooltipX = active
    ? Math.min(Math.max(barCenterX(activeIndex as number) - TOOLTIP_WIDTH / 2, MARGIN.left), chartWidth - MARGIN.right - TOOLTIP_WIDTH)
    : 0;
  const tooltipY = MARGIN.top + 4;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div ref={containerRef} dir="ltr" className="mt-4 overflow-x-auto">
        <svg
          ref={svgRef}
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          role="img"
          aria-label={t("title")}
          className="touch-none text-current select-none"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {valueTicks.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} y1={yForValue(tick)} x2={chartWidth - MARGIN.right} y2={yForValue(tick)} stroke="currentColor" strokeWidth={1} opacity={0.08} />
              <text x={MARGIN.left - 8} y={yForValue(tick) + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.6}>
                {money(tick)}
              </text>
            </g>
          ))}
          <line x1={MARGIN.left} y1={mainBottom} x2={chartWidth - MARGIN.right} y2={mainBottom} stroke="currentColor" strokeWidth={1} opacity={0.25} />

          {schedule.map((row, i) => {
            const isLast = i === schedule.length - 1;
            return (
              <g key={row.year} opacity={hoverIndex === null || i === hoverIndex ? 1 : 0.4}>
                <rect x={barX(i)} y={yForValue(loanAmount)} width={barWidth} height={Math.max(mainBottom - yForValue(loanAmount), 0)} className="fill-blue-600 dark:fill-blue-400" />
                <rect
                  x={barX(i)}
                  y={yForValue(row.endingBalance)}
                  width={barWidth}
                  height={Math.max(yForValue(loanAmount) - yForValue(row.endingBalance), 0)}
                  className="fill-amber-400 dark:fill-amber-500"
                />
                {isLast && (
                  <text x={barCenterX(i)} y={yForValue(row.endingBalance) - 10} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-100">
                    {money(row.endingBalance)}
                  </text>
                )}
              </g>
            );
          })}

          <text x={MARGIN.left - 8} y={volumeTop + 8} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.5}>
            {tShared("interestLabel")}
          </text>
          {schedule.map((row, i) => (
            <rect
              key={`vol-${row.year}`}
              x={barX(i)}
              y={yForVolume(row.interestAccrued)}
              width={barWidth}
              height={Math.max(volumeBottom - yForVolume(row.interestAccrued), 1)}
              rx={1}
              className="fill-amber-400/50 dark:fill-amber-500/50"
              opacity={hoverIndex === null || i === hoverIndex ? 1 : 0.4}
            />
          ))}
          <line x1={MARGIN.left} y1={volumeBottom} x2={chartWidth - MARGIN.right} y2={volumeBottom} stroke="currentColor" strokeWidth={1} opacity={0.15} />

          {schedule.map((row, i) => (
            <text key={`year-${row.year}`} x={barCenterX(i)} y={volumeBottom + XAXIS_HEIGHT - 6} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>
              {formatLocalizedNumber(row.year, digitStyle, { maximumFractionDigits: row.year % 1 === 0 ? 0 : 1 })}
            </text>
          ))}

          {active && activeIndex !== null && (
            <>
              <line x1={barCenterX(activeIndex)} y1={MARGIN.top} x2={barCenterX(activeIndex)} y2={volumeBottom} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.35} />
              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx={6} className="fill-white stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700" strokeWidth={1} />
                <text x={10} y={17} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {tShared("tooltipYearLabel")} {formatLocalizedNumber(active.year, digitStyle, { maximumFractionDigits: 1 })}
                </text>
                <text x={10} y={35} fontSize={10} className="fill-blue-700 dark:fill-blue-400">
                  {tShared("principalLabel")}: {money(loanAmount)}
                </text>
                <text x={10} y={50} fontSize={10} className="fill-amber-600 dark:fill-amber-500">
                  {tShared("interestLabel")}: {money(Math.max(active.endingBalance - loanAmount, 0))}
                </text>
                <text x={10} y={67} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {tShared("balanceLabel")}: {money(active.endingBalance)}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          {tShared("principalLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500" />
          {tShared("interestLabel")}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <span className="text-zinc-600 dark:text-zinc-300">
          {tShared("totalPrincipalLabel")}:{" "}
          <strong dir="ltr" className="text-zinc-900 dark:text-zinc-100">
            {money(loanAmount)}
          </strong>
        </span>
        <span className="text-zinc-600 dark:text-zinc-300">
          {tShared("totalInterestLabel")}:{" "}
          <strong dir="ltr" className="text-zinc-900 dark:text-zinc-100">
            {money(totalInterest)}
          </strong>
        </span>
      </div>
    </SectionCard>
  );
}
