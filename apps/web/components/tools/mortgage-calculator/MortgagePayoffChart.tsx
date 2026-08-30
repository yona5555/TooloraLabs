"use client";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { computeNiceTicks } from "./niceTicks";
import type { MortgageExtendedResult } from "./types";

type MortgagePayoffChartProps = {
  result: MortgageExtendedResult;
  digitStyle: DigitStyle;
};

const MARGIN = { top: 12, left: 56, right: 16 };
const MAIN_HEIGHT = 170;
const VOLUME_GAP = 18;
const VOLUME_HEIGHT = 40;
const XAXIS_HEIGHT = 20;
const CHART_HEIGHT = MARGIN.top + MAIN_HEIGHT + VOLUME_GAP + VOLUME_HEIGHT + XAXIS_HEIGHT;

const MIN_STEP = 22;
const BAR_WIDTH_RATIO = 14 / 22;
const TOOLTIP_WIDTH = 180;
const TOOLTIP_HEIGHT = 92;
/** Beyond this many years, only every Nth x-axis label is drawn so they don't overlap. */
const MAX_DENSE_LABELS = 40;

export default function MortgagePayoffChart({ result, digitStyle }: MortgagePayoffChartProps) {
  const t = useTranslations("tools.mortgage-calculator");
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const schedule = result.amortizationSchedule;
  const standardSchedule = result.standardAmortizationSchedule;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (schedule.length === 0) return null;

  const showComparison = result.extraMonthlyPayment > 0 && standardSchedule.length !== schedule.length;
  const initialBalance = result.loanAmount || 1;
  const maxYearPayment = Math.max(...schedule.map((row) => row.principalPaid + row.interestPaid), 1);

  const step = Math.max(MIN_STEP, (containerWidth - MARGIN.left - MARGIN.right) / schedule.length);
  const barWidth = step * BAR_WIDTH_RATIO;
  const plotWidth = schedule.length * step;
  const chartWidth = MARGIN.left + plotWidth + MARGIN.right;

  const balanceTicks = computeNiceTicks(initialBalance);
  const maxBalance = balanceTicks[balanceTicks.length - 1];

  const mainBottom = MARGIN.top + MAIN_HEIGHT;
  const yForBalance = (value: number) => mainBottom - (Math.min(Math.max(value, 0), maxBalance) / maxBalance) * MAIN_HEIGHT;

  const volumeTop = mainBottom + VOLUME_GAP;
  const volumeBottom = volumeTop + VOLUME_HEIGHT;
  const yForVolume = (value: number) => volumeBottom - (Math.max(value, 0) / maxYearPayment) * VOLUME_HEIGHT;

  const barX = (i: number) => MARGIN.left + i * step;
  const barCenterX = (i: number) => barX(i) + barWidth / 2;

  const currency = (value: number) => {
    const useCompact = Math.abs(value) >= 100_000;
    return formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", notation: useCompact ? "compact" : "standard", maximumFractionDigits: useCompact ? 1 : 0 });
  };

  function balancePolyline(rows: typeof schedule): string {
    const points = rows.map((row, i) => `${barCenterX(i)},${yForBalance(row.endingBalance)}`);
    return `${MARGIN.left},${yForBalance(initialBalance)} ${points.join(" ")}`;
  }

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

  const labelEvery = Math.max(1, Math.ceil(schedule.length / MAX_DENSE_LABELS));

  return (
    <SectionCard title={t("payoffChart.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("payoffChart.intro")}</p>

      <div ref={containerRef} dir="ltr" className="mt-4 overflow-x-auto">
        <svg
          ref={svgRef}
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          role="img"
          aria-label={t("payoffChart.title")}
          className="block touch-none text-current select-none"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {balanceTicks.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} y1={yForBalance(tick)} x2={chartWidth - MARGIN.right} y2={yForBalance(tick)} stroke="currentColor" strokeWidth={1} opacity={0.08} />
              <text x={MARGIN.left - 8} y={yForBalance(tick) + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.6}>
                {currency(tick)}
              </text>
            </g>
          ))}
          <line x1={MARGIN.left} y1={mainBottom} x2={chartWidth - MARGIN.right} y2={mainBottom} stroke="currentColor" strokeWidth={1} opacity={0.25} />

          {showComparison && (
            <polyline points={balancePolyline(standardSchedule)} fill="none" strokeWidth={1.5} strokeDasharray="4 3" className="stroke-zinc-400 dark:stroke-zinc-500" />
          )}
          <polyline points={balancePolyline(schedule)} fill="none" strokeWidth={2} className="stroke-zinc-900 dark:stroke-zinc-100" />

          <text x={MARGIN.left - 8} y={volumeTop + 8} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.5}>
            {t("payoffChart.interestLabel")}
          </text>
          {schedule.map((row, i) => {
            const total = row.principalPaid + row.interestPaid;
            const totalY = yForVolume(total);
            const interestY = yForVolume(row.interestPaid);
            return (
              <g key={row.year} opacity={hoverIndex === null || i === hoverIndex ? 1 : 0.4}>
                <rect x={barX(i)} y={totalY} width={barWidth} height={Math.max(volumeBottom - totalY, 0)} className="fill-blue-600 dark:fill-blue-400" />
                <rect x={barX(i)} y={interestY} width={barWidth} height={Math.max(volumeBottom - interestY, 0)} className="fill-amber-400/80 dark:fill-amber-500/80" />
              </g>
            );
          })}
          <line x1={MARGIN.left} y1={volumeBottom} x2={chartWidth - MARGIN.right} y2={volumeBottom} stroke="currentColor" strokeWidth={1} opacity={0.15} />

          {schedule.map((row, i) =>
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
                  {t("payoffChart.tooltipYearLabel")} {formatLocalizedNumber(active.year, digitStyle, { maximumFractionDigits: 0 })}
                </text>
                <text x={10} y={35} fontSize={10} className="fill-blue-700 dark:fill-blue-400">
                  {t("payoffChart.principalLabel")}: {currency(active.principalPaid)}
                </text>
                <text x={10} y={50} fontSize={10} className="fill-amber-600 dark:fill-amber-500">
                  {t("payoffChart.interestLabel")}: {currency(active.interestPaid)}
                </text>
                <text x={10} y={65} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {t("payoffChart.balanceLabel")}: {currency(active.endingBalance)}
                </text>
                {showComparison && (
                  <text x={10} y={82} fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
                    {t("payoffChart.standardBalanceLabel")}: {currency(standardSchedule[Math.min(activeIndex, standardSchedule.length - 1)]?.endingBalance ?? 0)}
                  </text>
                )}
              </g>
            </>
          )}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          {t("payoffChart.principalLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500" />
          {t("payoffChart.interestLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
          {t("payoffChart.balanceLabel")}
        </span>
        {showComparison && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-zinc-400 dark:border-zinc-600" />
            {t("payoffChart.standardBalanceLabel")}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <span className="text-zinc-600 dark:text-zinc-300">
          {t("payoffChart.totalPrincipalLabel")}:{" "}
          <strong dir="ltr" className="text-zinc-900 dark:text-zinc-100">
            {currency(result.loanAmount)}
          </strong>
        </span>
        <span className="text-zinc-600 dark:text-zinc-300">
          {t("payoffChart.totalInterestLabel")}:{" "}
          <strong dir="ltr" className="text-zinc-900 dark:text-zinc-100">
            {currency(result.actualTotalInterest)}
          </strong>
        </span>
      </div>

      {result.monthlyPMIFee > 0 && (
        <p className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
          {result.pmiDropoffMonth
            ? t("payoffChart.pmiNote", {
                dropYear: Math.ceil(result.pmiDropoffMonth / 12),
                autoYear: Math.ceil((result.pmiAutoTerminationMonth ?? result.pmiDropoffMonth) / 12),
              })
            : t("payoffChart.pmiNoDropoff")}
        </p>
      )}
    </SectionCard>
  );
}
