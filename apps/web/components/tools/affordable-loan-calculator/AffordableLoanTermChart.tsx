"use client";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { computeNiceTicks } from "./niceTicks";
import type { CurrencyCode } from "@/lib/currency";
import type { TermComparisonRow } from "./types";

type AffordableLoanTermChartProps = {
  hasCalculated: boolean;
  rows: TermComparisonRow[];
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

const MARGIN = { top: 16, left: 56, right: 16 };
const MAIN_HEIGHT = 190;
const XAXIS_HEIGHT = 22;
const CHART_HEIGHT = MARGIN.top + MAIN_HEIGHT + XAXIS_HEIGHT;

const MIN_STEP = 90;
const BAR_WIDTH_RATIO = 0.5;
const TOOLTIP_WIDTH = 180;
const TOOLTIP_HEIGHT = 78;

export default function AffordableLoanTermChart({ hasCalculated, rows, digitStyle, currency }: AffordableLoanTermChartProps) {
  const t = useTranslations("tools.affordable-loan-calculator");
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

  if (!hasCalculated || rows.length === 0) {
    return (
      <SectionCard title={t("termChart.title")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("termChart.emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  const step = Math.max(MIN_STEP, (containerWidth - MARGIN.left - MARGIN.right) / rows.length);
  const barWidth = step * BAR_WIDTH_RATIO;
  const plotWidth = rows.length * step;
  const chartWidth = MARGIN.left + plotWidth + MARGIN.right;

  const rawMax = Math.max(...rows.map((row) => row.maxLoanForPayment), 1);
  const valueTicks = computeNiceTicks(rawMax);
  const maxValue = valueTicks[valueTicks.length - 1];

  const mainBottom = MARGIN.top + MAIN_HEIGHT;
  const yForValue = (value: number) => mainBottom - (value / maxValue) * MAIN_HEIGHT;

  const groupX = (i: number) => MARGIN.left + i * step;
  const groupCenterX = (i: number) => groupX(i) + step / 2;
  const barX = (i: number) => groupCenterX(i) - barWidth / 2;

  const money = (value: number) => {
    const useCompact = Math.abs(value) >= 100_000;
    return formatLocalizedNumber(value, digitStyle, { style: "currency", currency, notation: useCompact ? "compact" : "standard", maximumFractionDigits: useCompact ? 1 : 0 });
  };

  const activeIndex = hoverIndex;
  const active = activeIndex !== null ? rows[activeIndex] : null;

  function updateHoverFromClientX(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * chartWidth;
    const index = Math.floor((localX - MARGIN.left) / step);
    setHoverIndex(Math.min(Math.max(index, 0), rows.length - 1));
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    updateHoverFromClientX(e.clientX);
  }

  const tooltipX = active
    ? Math.min(Math.max(groupCenterX(activeIndex as number) - TOOLTIP_WIDTH / 2, MARGIN.left), chartWidth - MARGIN.right - TOOLTIP_WIDTH)
    : 0;
  const tooltipY = MARGIN.top + 4;

  return (
    <SectionCard title={t("termChart.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("termChart.intro")}</p>

      <div ref={containerRef} dir="ltr" className="mt-4 overflow-x-auto">
        <svg
          ref={svgRef}
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          role="img"
          aria-label={t("termChart.title")}
          className="block touch-none text-current select-none"
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

          {rows.map((row, i) => (
            <g key={row.termYears} opacity={hoverIndex === null || i === hoverIndex ? 1 : 0.5}>
              <rect x={barX(i)} y={yForValue(row.maxLoanForPayment)} width={barWidth} height={Math.max(mainBottom - yForValue(row.maxLoanForPayment), 0)} rx={3} className="fill-blue-600 dark:fill-blue-400" />
              <text x={groupCenterX(i)} y={yForValue(row.maxLoanForPayment) - 8} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-100">
                {money(row.maxLoanForPayment)}
              </text>
              <text x={groupCenterX(i)} y={mainBottom + XAXIS_HEIGHT - 6} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
                {t("termChart.termLabel", { years: row.termYears })}
              </text>
            </g>
          ))}

          {active && activeIndex !== null && (
            <>
              <line x1={groupCenterX(activeIndex)} y1={MARGIN.top} x2={groupCenterX(activeIndex)} y2={mainBottom} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.35} />
              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx={6} className="fill-white stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700" strokeWidth={1} />
                <text x={10} y={17} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {t("termChart.termLabel", { years: active.termYears })}
                </text>
                <text x={10} y={35} fontSize={10} className="fill-blue-700 dark:fill-blue-400">
                  {t("termChart.maxLoanLabel")}: {money(active.maxLoanForPayment)}
                </text>
                <text x={10} y={50} fontSize={10} className="fill-zinc-600 dark:fill-zinc-300">
                  {t("termChart.paymentForLoanLabel")}: {money(active.monthlyPaymentForLoan)}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>
    </SectionCard>
  );
}
