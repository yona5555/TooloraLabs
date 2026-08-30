"use client";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { computeNiceTicks } from "./niceTicks";

type BreakEvenChartProps = {
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
  breakEvenUnits: number;
  /** When set (target-profit mode), an extra marker is drawn at this unit count. */
  targetProfitUnits?: number;
  digitStyle: DigitStyle;
  fixedCostsLabel: string;
  totalCostLabel: string;
  revenueLabel: string;
  breakEvenLabel: string;
  targetProfitLabel?: string;
  tooltipUnitsLabel: string;
  tooltipProfitLabel: string;
  chartAriaLabel: string;
};

const MARGIN = { top: 16, left: 56, right: 16, bottom: 26 };
const MAIN_HEIGHT = 200;
const CHART_HEIGHT = MARGIN.top + MAIN_HEIGHT + MARGIN.bottom;
const MIN_WIDTH = 320;
const TOOLTIP_WIDTH = 168;
const TOOLTIP_HEIGHT = 78;

export default function BreakEvenChart({
  fixedCosts,
  variableCostPerUnit,
  pricePerUnit,
  breakEvenUnits,
  targetProfitUnits = 0,
  digitStyle,
  fixedCostsLabel,
  totalCostLabel,
  revenueLabel,
  breakEvenLabel,
  targetProfitLabel,
  tooltipUnitsLabel,
  tooltipProfitLabel,
  chartAriaLabel,
}: BreakEvenChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverUnits, setHoverUnits] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Show a bit beyond the furthest marker (break-even, or target profit if further out) so the
  // crossing point(s) sit comfortably inside the plot instead of right at the edge.
  const furthestMarker = Math.max(breakEvenUnits, targetProfitUnits);
  const rawMaxUnits = Math.max(furthestMarker * 1.4, 10);
  const unitTicks = computeNiceTicks(rawMaxUnits, 6);
  const maxUnits = unitTicks[unitTicks.length - 1];

  const rawMaxValue = Math.max(fixedCosts + variableCostPerUnit * maxUnits, pricePerUnit * maxUnits, 1);
  const valueTicks = computeNiceTicks(rawMaxValue);
  const maxValue = valueTicks[valueTicks.length - 1];

  const chartWidth = Math.max(containerWidth, MIN_WIDTH);
  const plotWidth = chartWidth - MARGIN.left - MARGIN.right;
  const mainBottom = MARGIN.top + MAIN_HEIGHT;

  const xFor = (units: number) => MARGIN.left + (units / maxUnits) * plotWidth;
  const yFor = (value: number) => mainBottom - (value / maxValue) * MAIN_HEIGHT;

  const totalCostAtMax = fixedCosts + variableCostPerUnit * maxUnits;
  const revenueAtMax = pricePerUnit * maxUnits;

  const beX = xFor(breakEvenUnits);
  const beY = yFor(fixedCosts + variableCostPerUnit * breakEvenUnits);

  const currency = (value: number) => {
    const useCompact = Math.abs(value) >= 100_000;
    return formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency: "USD",
      notation: useCompact ? "compact" : "standard",
      maximumFractionDigits: useCompact ? 1 : 0,
    });
  };

  function updateHoverFromClientX(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * chartWidth;
    const units = Math.round(((localX - MARGIN.left) / plotWidth) * maxUnits);
    setHoverUnits(Math.min(Math.max(units, 0), maxUnits));
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    updateHoverFromClientX(e.clientX);
  }

  const hoverCost = hoverUnits !== null ? fixedCosts + variableCostPerUnit * hoverUnits : 0;
  const hoverRevenue = hoverUnits !== null ? pricePerUnit * hoverUnits : 0;
  const hoverProfit = hoverRevenue - hoverCost;
  const hoverX = hoverUnits !== null ? xFor(hoverUnits) : 0;

  const tooltipX = hoverUnits !== null ? Math.min(Math.max(hoverX - TOOLTIP_WIDTH / 2, MARGIN.left), chartWidth - MARGIN.right - TOOLTIP_WIDTH) : 0;
  const tooltipY = MARGIN.top + 4;

  const tpX = targetProfitUnits > 0 ? xFor(targetProfitUnits) : 0;
  const tpY = targetProfitUnits > 0 ? yFor(pricePerUnit * targetProfitUnits) : 0;

  return (
    <figure className="my-1">
      <div ref={containerRef} dir="ltr" className="overflow-x-auto">
        <svg
          ref={svgRef}
          width={chartWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          role="img"
          aria-label={chartAriaLabel}
          className="block touch-none text-current select-none"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setHoverUnits(null)}
        >
          {/* value axis gridlines + labels */}
          {valueTicks.map((tick) => (
            <g key={tick}>
              <line x1={MARGIN.left} y1={yFor(tick)} x2={chartWidth - MARGIN.right} y2={yFor(tick)} stroke="currentColor" strokeWidth={1} opacity={0.08} />
              <text x={MARGIN.left - 8} y={yFor(tick) + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.6}>
                {currency(tick)}
              </text>
            </g>
          ))}
          <line x1={MARGIN.left} y1={mainBottom} x2={chartWidth - MARGIN.right} y2={mainBottom} stroke="currentColor" strokeWidth={1} opacity={0.25} />

          {/* units axis labels */}
          {unitTicks.map((tick) => (
            <text key={tick} x={xFor(tick)} y={mainBottom + 16} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>
              {formatLocalizedNumber(tick, digitStyle, { maximumFractionDigits: 0 })}
            </text>
          ))}

          {/* fixed costs line (flat) */}
          <line x1={xFor(0)} y1={yFor(fixedCosts)} x2={xFor(maxUnits)} y2={yFor(fixedCosts)} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />

          {/* total cost line */}
          <line x1={xFor(0)} y1={yFor(fixedCosts)} x2={xFor(maxUnits)} y2={yFor(totalCostAtMax)} className="stroke-amber-500 dark:stroke-amber-400" strokeWidth={2} />

          {/* revenue line */}
          <line x1={xFor(0)} y1={yFor(0)} x2={xFor(maxUnits)} y2={yFor(revenueAtMax)} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={2} />

          {/* break-even marker */}
          <line x1={beX} y1={MARGIN.top} x2={beX} y2={mainBottom} stroke="currentColor" strokeWidth={1} strokeDasharray="2 2" opacity={0.35} />
          <circle cx={beX} cy={beY} r={4} className="fill-zinc-900 dark:fill-zinc-100" />
          <text x={beX} y={mainBottom + 16} textAnchor="middle" fontSize={9} fontWeight={700} fill="currentColor">
            {formatLocalizedNumber(breakEvenUnits, digitStyle, { maximumFractionDigits: 0 })}
          </text>

          {/* optional target-profit marker */}
          {targetProfitUnits > 0 && (
            <>
              <line x1={tpX} y1={MARGIN.top} x2={tpX} y2={mainBottom} className="stroke-emerald-500 dark:stroke-emerald-400" strokeWidth={1} strokeDasharray="2 2" opacity={0.6} />
              <circle cx={tpX} cy={tpY} r={4} className="fill-emerald-500 dark:fill-emerald-400" />
            </>
          )}

          {hoverUnits !== null && (
            <>
              <line x1={hoverX} y1={MARGIN.top} x2={hoverX} y2={mainBottom} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" opacity={0.35} />
              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx={6} className="fill-white stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700" strokeWidth={1} />
                <text x={10} y={17} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {tooltipUnitsLabel}: {formatLocalizedNumber(hoverUnits, digitStyle, { maximumFractionDigits: 0 })}
                </text>
                <text x={10} y={35} fontSize={10} className="fill-amber-600 dark:fill-amber-500">
                  {totalCostLabel}: {currency(hoverCost)}
                </text>
                <text x={10} y={50} fontSize={10} className="fill-blue-700 dark:fill-blue-400">
                  {revenueLabel}: {currency(hoverRevenue)}
                </text>
                <text x={10} y={67} fontSize={10} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                  {tooltipProfitLabel}: {currency(hoverProfit)}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          {revenueLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400" />
          {totalCostLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
          {breakEvenLabel}
        </span>
        {targetProfitUnits > 0 && targetProfitLabel && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            {targetProfitLabel}
          </span>
        )}
      </div>

      <figcaption className="mt-1 text-xs opacity-70">{fixedCostsLabel}</figcaption>
    </figure>
  );
}
