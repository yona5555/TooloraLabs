"use client";
import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useLoanLiveInputs } from "./LoanLiveInputsContext";
import { computeNiceTicks, computeNiceStep } from "./niceTicks";

const MARGIN = { top: 16, left: 56, right: 16 };
const MAIN_HEIGHT = 200;
const XAXIS_HEIGHT = 22;
const CHART_HEIGHT = MARGIN.top + MAIN_HEIGHT + XAXIS_HEIGHT;

/** Minimum pixel distance between period points before the chart switches from stretching to fill its card to horizontal scrolling. */
const MIN_STEP = 10;
const TOOLTIP_WIDTH = 168;
const TOOLTIP_HEIGHT = 92;
/** Minimum pixel gap a period label needs (digits + breathing room) before labels start colliding. */
const MIN_LABEL_SPACING = 32;

export default function LoanAmortizationAreaChart() {
  const t = useTranslations("tools.loan-calculator");
  const live = useLoanLiveInputs();
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

  const liveSchedule = live?.amortizedSchedule;
  const digitStyle = live?.digitStyle ?? "western";
  const currency = live?.currency ?? "USD";

  const schedule = useMemo(() => liveSchedule ?? [], [liveSchedule]);

  const crossoverPeriod = useMemo(() => {
    const row = schedule.find((r) => r.principalPaid > r.interestPaid);
    return row?.period ?? null;
  }, [schedule]);

  if (!live || !live.hasCalculatedAmortized || schedule.length === 0) {
    return (
      <SectionCard title={t("education.intro.diagram.title")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("education.intro.diagram.emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  const pointCount = schedule.length;
  const step = Math.max(MIN_STEP, (containerWidth - MARGIN.left - MARGIN.right) / Math.max(pointCount - 1, 1));
  const plotWidth = Math.max(pointCount - 1, 1) * step;
  const chartWidth = MARGIN.left + plotWidth + MARGIN.right;

  const rawMaxValue = Math.max(...schedule.map((row) => row.principalPaid + row.interestPaid), 1);
  const valueTicks = computeNiceTicks(rawMaxValue);
  const maxValue = valueTicks[valueTicks.length - 1];

  const mainBottom = MARGIN.top + MAIN_HEIGHT;
  const yForValue = (value: number) => mainBottom - (value / maxValue) * MAIN_HEIGHT;
  const xForIndex = (i: number) => MARGIN.left + i * step;

  // Two stacked boundaries per period: the principal/interest seam, and the top of the (constant,
  // for a fixed-payment loan) total payment. Drawing them as filled bands, rather than per-period
  // bars, keeps the original diagram's "area from start to end of loan" visual metaphor intact.
  const principalBoundary = schedule.map((row, i) => `${xForIndex(i).toFixed(1)},${yForValue(row.principalPaid).toFixed(1)}`);
  const totalBoundary = schedule.map((row, i) => `${xForIndex(i).toFixed(1)},${yForValue(row.principalPaid + row.interestPaid).toFixed(1)}`);

  const principalAreaPoints = `${xForIndex(0).toFixed(1)},${mainBottom} ${principalBoundary.join(" ")} ${xForIndex(pointCount - 1).toFixed(1)},${mainBottom}`;
  const interestAreaPoints = `${totalBoundary.join(" ")} ${[...principalBoundary].reverse().join(" ")}`;

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
    const index = Math.round((localX - MARGIN.left) / step);
    setHoverIndex(Math.min(Math.max(index, 0), pointCount - 1));
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    updateHoverFromClientX(e.clientX);
  }

  const tooltipX = active
    ? Math.min(Math.max(xForIndex(activeIndex as number) - TOOLTIP_WIDTH / 2, MARGIN.left), chartWidth - MARGIN.right - TOOLTIP_WIDTH)
    : 0;
  const tooltipY = MARGIN.top + 4;

  // Nice/readable x-axis ticks: pick the smallest 1/2/5×10ⁿ interval (same family the value
  // axis uses) that keeps consecutive labels at least MIN_LABEL_SPACING px apart, rather than
  // a fixed point-count threshold that stays illegible whenever periods render close together.
  const maxLabelsFit = Math.max(1, Math.floor(plotWidth / MIN_LABEL_SPACING));
  const labelEvery = pointCount <= maxLabelsFit ? 1 : computeNiceStep(pointCount / maxLabelsFit);

  const caption =
    crossoverPeriod !== null
      ? t("education.intro.diagram.caption", { period: formatLocalizedNumber(crossoverPeriod, digitStyle, { maximumFractionDigits: 0 }) })
      : t("education.intro.diagram.captionNoCrossover");

  return (
    <SectionCard title={t("education.intro.diagram.title")}>
      <div ref={containerRef} dir="ltr" className="overflow-x-auto">
        <svg
          ref={svgRef}
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          role="img"
          aria-label={t("education.intro.diagram.chartAriaLabel")}
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

          <polygon points={interestAreaPoints} className="fill-amber-400/70 dark:fill-amber-500/60" />
          <polygon points={principalAreaPoints} className="fill-blue-600 dark:fill-blue-400" />
          <polyline points={principalBoundary.join(" ")} fill="none" className="stroke-blue-800 dark:stroke-blue-200" strokeWidth={1.5} />

          {schedule.map((row, i) =>
            i % labelEvery === 0 ? (
              <text key={`period-${row.period}`} x={xForIndex(i)} y={mainBottom + XAXIS_HEIGHT - 6} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>
                {formatLocalizedNumber(row.period, digitStyle, { maximumFractionDigits: 0 })}
              </text>
            ) : null
          )}

          {active && activeIndex !== null && (
            <>
              <line x1={xForIndex(activeIndex)} y1={MARGIN.top} x2={xForIndex(activeIndex)} y2={mainBottom} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.35} />
              <circle cx={xForIndex(activeIndex)} cy={yForValue(active.principalPaid)} r={3} className="fill-blue-800 dark:fill-blue-200" />

              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx={6} className="fill-white stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700" strokeWidth={1} />
                <text x={10} y={17} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {t("payoffChart.tooltipPeriodLabel")} {formatLocalizedNumber(active.period, digitStyle, { maximumFractionDigits: 0 })}
                </text>
                <text x={10} y={35} fontSize={10} className="fill-blue-700 dark:fill-blue-400">
                  {t("payoffChart.principalLabel")}: {money(active.principalPaid)}
                </text>
                <text x={10} y={50} fontSize={10} className="fill-amber-600 dark:fill-amber-500">
                  {t("payoffChart.interestLabel")}: {money(active.interestPaid)}
                </text>
                <text x={10} y={65} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {t("payoffChart.balanceLabel")}: {money(active.endingBalance)}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          {t("payoffChart.principalLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500" />
          {t("payoffChart.interestLabel")}
        </span>
      </div>

      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{caption}</p>
    </SectionCard>
  );
}
