"use client";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { computeNiceTicks } from "./niceTicks";
import type { CurrencyCode } from "@/lib/currency";
import type { ComparisonRow } from "./types";

type BorrowingComparisonChartProps = {
  rows: ComparisonRow[];
  digitStyle: DigitStyle;
  currency: CurrencyCode;
};

const PURPOSE_FILL: Record<string, string> = {
  home: "fill-blue-600 dark:fill-blue-400",
  car: "fill-teal-500 dark:fill-teal-400",
  business: "fill-violet-500 dark:fill-violet-400",
  personal: "fill-amber-500 dark:fill-amber-400",
};

const MARGIN = { top: 16, left: 64, right: 16 };
const MAIN_HEIGHT = 200;
const XAXIS_HEIGHT = 22;
const CHART_HEIGHT = MARGIN.top + MAIN_HEIGHT + XAXIS_HEIGHT;

const MIN_STEP = 100;
const BAR_WIDTH_RATIO = 0.5;
const TOOLTIP_WIDTH = 170;
const TOOLTIP_HEIGHT = 56;

export default function BorrowingComparisonChart({ rows, digitStyle, currency }: BorrowingComparisonChartProps) {
  const t = useTranslations("tools.house-affordability-calculator");
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

  const step = Math.max(MIN_STEP, (containerWidth - MARGIN.left - MARGIN.right) / rows.length);
  const barWidth = step * BAR_WIDTH_RATIO;
  const plotWidth = rows.length * step;
  const chartWidth = MARGIN.left + plotWidth + MARGIN.right;

  const rawMax = Math.max(...rows.map((row) => row.maxAmount), 1);
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
    <SectionCard id="borrowing-comparison" title={t("comparisonChart.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("comparisonChart.intro")}</p>

      <div ref={containerRef} dir="ltr" className="mt-4 overflow-x-auto">
        <svg
          ref={svgRef}
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          role="img"
          aria-label={t("comparisonChart.title")}
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
            <g key={row.purpose} opacity={hoverIndex === null || i === hoverIndex ? 1 : 0.5}>
              <rect x={barX(i)} y={yForValue(row.maxAmount)} width={barWidth} height={Math.max(mainBottom - yForValue(row.maxAmount), 0)} rx={3} className={PURPOSE_FILL[row.purpose]} />
              <text x={groupCenterX(i)} y={yForValue(row.maxAmount) - 8} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-100">
                {money(row.maxAmount)}
              </text>
              <text x={groupCenterX(i)} y={mainBottom + XAXIS_HEIGHT - 6} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
                {t(`comparisonChart.purposeLabels.${row.purpose}`)}
              </text>
            </g>
          ))}

          {active && activeIndex !== null && (
            <>
              <line x1={groupCenterX(activeIndex)} y1={MARGIN.top} x2={groupCenterX(activeIndex)} y2={mainBottom} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.35} />
              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx={6} className="fill-white stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700" strokeWidth={1} />
                <text x={10} y={17} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {t(`comparisonChart.purposeLabels.${active.purpose}`)}
                </text>
                <text x={10} y={35} fontSize={10} className="fill-zinc-600 dark:fill-zinc-300">
                  {t("comparisonChart.maxAmountLabel")}: {money(active.maxAmount)}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        {rows.map((row) => (
          <span key={row.purpose} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${PURPOSE_FILL[row.purpose].replace("fill-", "bg-")}`} />
            {t(`comparisonChart.purposeLabels.${row.purpose}`)}
          </span>
        ))}
      </div>
    </SectionCard>
  );
}
