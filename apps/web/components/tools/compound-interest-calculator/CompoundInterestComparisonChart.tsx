"use client";
import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { calculateSimpleInterestSchedule } from "@tooloralabs/tools";
import { useCompoundInterestLiveInputs } from "./CompoundInterestLiveInputsContext";
import { computeNiceTicks } from "./niceTicks";

const MARGIN = { top: 16, left: 56, right: 16 };
const MAIN_HEIGHT = 170;
const VOLUME_GAP = 18;
const VOLUME_HEIGHT = 44;
const XAXIS_HEIGHT = 22;
const CHART_HEIGHT = MARGIN.top + MAIN_HEIGHT + VOLUME_GAP + VOLUME_HEIGHT + XAXIS_HEIGHT;

/** Minimum pixel width per year group before the chart switches from stretching to fill its card to horizontal scrolling. */
const MIN_STEP = 36;
/** Fraction of each step the compound+simple bar group occupies, preserving the original 24/36 group-to-gap proportion at any step size. */
const GROUP_WIDTH_RATIO = 24 / 36;
/** Fraction of the group width spent on the gap between its two bars, preserving the original 2/24 proportion. */
const BAR_GAP_RATIO = 2 / 24;

const TOOLTIP_WIDTH = 168;
const TOOLTIP_HEIGHT = 78;

/** One year's compound vs. simple balance, plus that year's marginal (non-cumulative) gain from compounding. */
type BarPoint = { year: number; compound: number; simple: number; gap: number; volumeGap: number };

export default function CompoundInterestComparisonChart() {
  const t = useTranslations("tools.compound-interest-calculator");
  const live = useCompoundInterestLiveInputs();
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

  const simpleSchedule = useMemo(() => {
    if (!live) return [];
    return calculateSimpleInterestSchedule(live.principal, live.rate, live.years, live.monthlyContribution, live.taxRate);
  }, [live]);

  const points: BarPoint[] = useMemo(() => {
    if (!live) return [];
    const result: BarPoint[] = [];
    let previousGap = 0;
    live.yearlySchedule.forEach((row, i) => {
      const simpleBalance = simpleSchedule[i]?.balance ?? row.balance;
      const gap = row.balance - simpleBalance;
      result.push({ year: row.year, compound: row.balance, simple: simpleBalance, gap, volumeGap: gap - previousGap });
      previousGap = gap;
    });
    return result;
  }, [live, simpleSchedule]);

  if (!live || !live.hasCalculated || points.length === 0) {
    return (
      <div className="my-2 flex flex-col items-center justify-center gap-3 rounded-sm border border-current/20 py-10 text-center">
        <Calculator size={28} className="opacity-40" />
        <p className="max-w-xs text-sm opacity-70">{t("education.intro.diagram.emptyStateMessage")}</p>
      </div>
    );
  }

  // Stretches bar groups to fill the full measured card width when there's room; falls back to
  // MIN_STEP (and lets the wrapper scroll horizontally) once that would squeeze bars too thin to read.
  const step = Math.max(MIN_STEP, (containerWidth - MARGIN.left - MARGIN.right) / points.length);
  const groupWidth = step * GROUP_WIDTH_RATIO;
  const barGap = groupWidth * BAR_GAP_RATIO;
  const barWidth = (groupWidth - barGap) / 2;
  const plotWidth = points.length * step;
  const chartWidth = MARGIN.left + plotWidth + MARGIN.right;
  const rawMaxValue = Math.max(...points.map((p) => Math.max(p.compound, p.simple)), 1);
  const maxVolume = Math.max(...points.map((p) => Math.abs(p.volumeGap)), 1);

  const valueTicks = computeNiceTicks(rawMaxValue);
  const maxValue = valueTicks[valueTicks.length - 1];

  const mainBottom = MARGIN.top + MAIN_HEIGHT;
  const yForValue = (value: number) => mainBottom - (value / maxValue) * MAIN_HEIGHT;

  const volumeTop = mainBottom + VOLUME_GAP;
  const volumeBottom = volumeTop + VOLUME_HEIGHT;
  const yForVolume = (value: number) => volumeBottom - (Math.max(value, 0) / maxVolume) * VOLUME_HEIGHT;

  const groupX = (i: number) => MARGIN.left + i * step;
  const groupCenterX = (i: number) => groupX(i) + groupWidth / 2;

  const currency = (value: number, compact = true) => {
    const useCompact = compact && Math.abs(value) >= 100_000;
    return formatLocalizedNumber(value, live.digitStyle, {
      style: "currency",
      currency: "USD",
      notation: useCompact ? "compact" : "standard",
      maximumFractionDigits: useCompact ? 1 : 0,
    });
  };

  const yearsText = (value: number) => `${formatLocalizedNumber(value, live.digitStyle, { maximumFractionDigits: 0 })} ${t("aboveFold.yearsUnit")}`;

  const activeIndex = hoverIndex;
  const active = activeIndex !== null ? points[activeIndex] : null;
  const finalPoint = points[points.length - 1];
  const finalDifference = Math.max(finalPoint.gap, 0);

  function updateHoverFromClientX(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * chartWidth;
    const index = Math.round((localX - MARGIN.left - groupWidth / 2) / step);
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
    <figure className="my-2">
      <div ref={containerRef} dir="ltr" className="overflow-x-auto">
        <svg
          ref={svgRef}
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          role="img"
          aria-label={t("education.intro.diagram.chartAriaLabel")}
          className="block touch-none text-current select-none"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {/* main chart gridlines + value axis labels */}
          {valueTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                y1={yForValue(tick)}
                x2={chartWidth - MARGIN.right}
                y2={yForValue(tick)}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.08}
              />
              <text x={MARGIN.left - 8} y={yForValue(tick) + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.6}>
                {currency(tick)}
              </text>
            </g>
          ))}
          <line x1={MARGIN.left} y1={mainBottom} x2={chartWidth - MARGIN.right} y2={mainBottom} stroke="currentColor" strokeWidth={1} opacity={0.25} />

          {/* grouped bars: compound + simple, side by side, per year */}
          {points.map((p, i) => (
            <g key={p.year} opacity={hoverIndex === null || i === hoverIndex ? 1 : 0.4}>
              <rect
                x={groupX(i)}
                y={yForValue(p.compound)}
                width={barWidth}
                height={Math.max(mainBottom - yForValue(p.compound), 0)}
                className="fill-blue-600 dark:fill-blue-400"
              />
              <rect
                x={groupX(i) + barWidth + barGap}
                y={yForValue(p.simple)}
                width={barWidth}
                height={Math.max(mainBottom - yForValue(p.simple), 0)}
                className="fill-amber-400 dark:fill-amber-500"
              />
            </g>
          ))}

          {/* volume row: that year's marginal (non-cumulative) gain from compounding */}
          <text x={MARGIN.left - 8} y={volumeTop + 8} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.5}>
            {t("education.intro.diagram.volumeLabel")}
          </text>
          {points.map((p, i) => (
            <rect
              key={`vol-${p.year}`}
              x={groupX(i) + 1}
              y={yForVolume(p.volumeGap)}
              width={Math.max(groupWidth - 2, 1)}
              height={Math.max(volumeBottom - yForVolume(p.volumeGap), 1)}
              rx={1}
              className="fill-blue-600/40 dark:fill-blue-400/40"
              opacity={hoverIndex === null || i === hoverIndex ? 1 : 0.4}
            />
          ))}
          <line x1={MARGIN.left} y1={volumeBottom} x2={chartWidth - MARGIN.right} y2={volumeBottom} stroke="currentColor" strokeWidth={1} opacity={0.15} />

          {/* x-axis: whole year labels, one per bar group */}
          {points.map((p, i) => (
            <text
              key={`year-${p.year}`}
              x={groupCenterX(i)}
              y={volumeBottom + XAXIS_HEIGHT - 6}
              textAnchor="middle"
              fontSize={9}
              fill="currentColor"
              opacity={0.6}
            >
              {formatLocalizedNumber(p.year, live.digitStyle, { maximumFractionDigits: 0 })}
            </text>
          ))}

          {active && activeIndex !== null && (
            <>
              <line
                x1={groupCenterX(activeIndex)}
                y1={MARGIN.top}
                x2={groupCenterX(activeIndex)}
                y2={volumeBottom}
                stroke="currentColor"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.35}
              />

              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect
                  width={TOOLTIP_WIDTH}
                  height={TOOLTIP_HEIGHT}
                  rx={6}
                  className="fill-white stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700"
                  strokeWidth={1}
                />
                <text x={10} y={17} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {t("education.intro.diagram.tooltipYearLabel")} {formatLocalizedNumber(active.year, live.digitStyle, { maximumFractionDigits: 0 })}
                </text>
                <text x={10} y={35} fontSize={10} className="fill-blue-700 dark:fill-blue-400">
                  {t("education.intro.diagram.compoundLabel")}: {currency(active.compound, false)}
                </text>
                <text x={10} y={50} fontSize={10} className="fill-amber-600 dark:fill-amber-500">
                  {t("education.intro.diagram.simpleLabel")}: {currency(active.simple, false)}
                </text>
                <text x={10} y={67} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {t("education.intro.diagram.tooltipDifferenceLabel")}: {currency(active.gap, false)}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          {t("education.intro.diagram.compoundLabel")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 dark:bg-amber-500" />
          {t("education.intro.diagram.simpleLabel")}
        </span>
      </div>

      <figcaption className="mt-2 text-sm opacity-70">
        {t("education.intro.diagram.caption", { years: yearsText(finalPoint.year), difference: currency(finalDifference, false) })}
      </figcaption>
    </figure>
  );
}
