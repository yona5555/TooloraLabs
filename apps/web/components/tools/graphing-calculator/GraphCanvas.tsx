"use client";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import type { GraphPoint } from "./types";

type Props = {
  points: GraphPoint[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

const WIDTH = 600;
const HEIGHT = 340;
const PAD = 28;
const TOOLTIP_WIDTH = 120;
const TOOLTIP_HEIGHT = 40;

function fmt(n: number): string {
  const rounded = Math.round(n * 1000) / 1000;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

export default function GraphCanvas({ points, xMin, xMax, yMin, yMax }: Props) {
  const t = useTranslations("tools.graphing-calculator.result");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotW = WIDTH - PAD * 2;
  const plotH = HEIGHT - PAD * 2;

  const rangeY = yMax - yMin || 1;
  const rangeX = xMax - xMin || 1;

  const mapX = (x: number) => PAD + ((x - xMin) / rangeX) * plotW;
  const mapY = (y: number) => PAD + plotH - ((y - yMin) / rangeY) * plotH;

  const segments: string[] = [];
  let current: string[] = [];
  for (const point of points) {
    if (point.y === null) {
      if (current.length > 1) segments.push(current.join(" "));
      current = [];
      continue;
    }
    current.push(`${mapX(point.x).toFixed(2)},${mapY(point.y).toFixed(2)}`);
  }
  if (current.length > 1) segments.push(current.join(" "));

  const showXAxis = yMin <= 0 && yMax >= 0;
  const showYAxis = xMin <= 0 && xMax >= 0;

  function updateHoverFromClientX(clientX: number) {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * WIDTH;
    const targetX = xMin + ((localX - PAD) / plotW) * rangeX;
    let nearest = 0;
    let bestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - targetX);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  const active = hoverIndex !== null ? points[hoverIndex] : null;
  const activeHasY = active !== null && active.y !== null;
  const tooltipX = activeHasY ? Math.min(Math.max(mapX(active.x) - TOOLTIP_WIDTH / 2, PAD), WIDTH - PAD - TOOLTIP_WIDTH) : 0;
  const tooltipY = PAD + 6;

  return (
    <div dir="ltr">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t("heading")}
        className="w-full touch-none rounded-xl border border-zinc-200 bg-white select-none dark:border-zinc-700 dark:bg-zinc-900"
        onPointerMove={(e: ReactPointerEvent<SVGSVGElement>) => updateHoverFromClientX(e.clientX)}
        onPointerDown={(e: ReactPointerEvent<SVGSVGElement>) => updateHoverFromClientX(e.clientX)}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <rect x={PAD} y={PAD} width={plotW} height={plotH} fill="none" stroke="currentColor" className="text-zinc-200 dark:text-zinc-700" />

        {showYAxis && (
          <line x1={mapX(0)} y1={PAD} x2={mapX(0)} y2={PAD + plotH} stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" strokeWidth={1} />
        )}
        {showXAxis && (
          <line x1={PAD} y1={mapY(0)} x2={PAD + plotW} y2={mapY(0)} stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" strokeWidth={1} />
        )}

        {segments.map((d, i) => (
          <polyline key={i} points={d} fill="none" stroke="#2563eb" strokeWidth={2} />
        ))}

        <text x={PAD} y={HEIGHT - 6} fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
          {xMin.toFixed(2)}
        </text>
        <text x={WIDTH - PAD} y={HEIGHT - 6} fontSize={11} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
          {xMax.toFixed(2)}
        </text>
        <text x={2} y={PAD + 4} fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
          {yMax.toFixed(2)}
        </text>
        <text x={2} y={HEIGHT - PAD} fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
          {yMin.toFixed(2)}
        </text>

        {active && (
          <line x1={mapX(active.x)} y1={PAD} x2={mapX(active.x)} y2={PAD + plotH} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" className="text-zinc-400 dark:text-zinc-500" />
        )}
        {activeHasY && active && (
          <>
            <circle cx={mapX(active.x)} cy={mapY(active.y as number)} r={4} className="fill-blue-600 dark:fill-blue-400" />
            <g transform={`translate(${tooltipX}, ${tooltipY})`}>
              <rect width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx={6} className="fill-white stroke-zinc-200 dark:fill-zinc-900 dark:stroke-zinc-700" strokeWidth={1} />
              <text x={10} y={17} fontSize={10} className="fill-zinc-700 dark:fill-zinc-200">
                x: {fmt(active.x)}
              </text>
              <text x={10} y={31} fontSize={10} fontWeight={700} className="fill-blue-700 dark:fill-blue-400">
                y: {fmt(active.y as number)}
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
