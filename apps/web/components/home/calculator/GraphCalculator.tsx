"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { compileGraphFormula } from "@/lib/home-calculator/graphEngine";

const VIEW_MIN = -10;
const VIEW_MAX = 10;
const WIDTH = 400;
const HEIGHT = 300;
const MARGIN = 24;
const SAMPLES = 400;
const TICKS = [-10, -5, 5, 10];

function xToPixel(x: number): number {
  return MARGIN + ((x - VIEW_MIN) / (VIEW_MAX - VIEW_MIN)) * (WIDTH - 2 * MARGIN);
}
function yToPixel(y: number): number {
  return HEIGHT - MARGIN - ((y - VIEW_MIN) / (VIEW_MAX - VIEW_MIN)) * (HEIGHT - 2 * MARGIN);
}

/**
 * Samples the formula across the fixed [-10, 10] view and splits the result
 * into separate polyline segments wherever the function is undefined (a
 * real domain error, e.g. sqrt of a negative) or jumps by an implausibly
 * large amount between two adjacent samples (an asymptote, e.g. tan(x) near
 * pi/2, or 1/x near 0) — drawing one continuous polyline straight across
 * either case would connect two far-apart branches with a fake diagonal
 * line that isn't part of the actual function.
 */
function sampleSegments(fn: (x: number) => number | null): { x: number; y: number }[][] {
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  let prevY: number | null = null;

  for (let i = 0; i <= SAMPLES; i++) {
    const x = VIEW_MIN + (i / SAMPLES) * (VIEW_MAX - VIEW_MIN);
    const y = fn(x);
    const inRange = y !== null && Number.isFinite(y) && y >= VIEW_MIN - 5 && y <= VIEW_MAX + 5;

    if (!inRange) {
      if (current.length > 1) segments.push(current);
      current = [];
      prevY = null;
      continue;
    }
    if (prevY !== null && Math.abs(y - prevY) > (VIEW_MAX - VIEW_MIN) * 4) {
      if (current.length > 1) segments.push(current);
      current = [];
    }
    current.push({ x, y });
    prevY = y;
  }
  if (current.length > 1) segments.push(current);
  return segments;
}

export default function GraphCalculator() {
  const tHome = useTranslations("homeCalculator");
  const [formula, setFormula] = useState("x^2");

  const { segments, invalid } = useMemo(() => {
    const fn = compileGraphFormula(formula);
    if (!fn) return { segments: [], invalid: true };
    return { segments: sampleSegments(fn), invalid: false };
  }, [formula]);

  return (
    <div dir="ltr" className="flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 calcdark:border-zinc-600 calcdark:bg-zinc-800">
        <span className="shrink-0 font-mono text-sm font-semibold text-blue-600 calcdark:text-blue-400">y =</span>
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="x^2"
          className="min-w-0 flex-1 bg-transparent font-mono text-sm text-zinc-900 outline-none placeholder:text-zinc-400 calcdark:text-zinc-100"
        />
      </div>

      {invalid && <p className="text-xs text-red-600 calcdark:text-red-400">{tHome("graph.invalidFormula")}</p>}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white calcdark:border-zinc-700 calcdark:bg-zinc-900">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label={tHome("graph.chartLabel", { formula })}>
          {/* grid + ticks */}
          {TICKS.map((t) => (
            <line key={`vx-${t}`} x1={xToPixel(t)} y1={MARGIN} x2={xToPixel(t)} y2={HEIGHT - MARGIN} className="stroke-zinc-100 calcdark:stroke-zinc-800" strokeWidth={1} />
          ))}
          {TICKS.map((t) => (
            <line key={`vy-${t}`} x1={MARGIN} y1={yToPixel(t)} x2={WIDTH - MARGIN} y2={yToPixel(t)} className="stroke-zinc-100 calcdark:stroke-zinc-800" strokeWidth={1} />
          ))}

          {/* axes */}
          <line x1={MARGIN} y1={yToPixel(0)} x2={WIDTH - MARGIN} y2={yToPixel(0)} className="stroke-zinc-400 calcdark:stroke-zinc-500" strokeWidth={1.5} />
          <line x1={xToPixel(0)} y1={MARGIN} x2={xToPixel(0)} y2={HEIGHT - MARGIN} className="stroke-zinc-400 calcdark:stroke-zinc-500" strokeWidth={1.5} />

          {TICKS.map((t) => (
            <text key={`lx-${t}`} x={xToPixel(t)} y={yToPixel(0) + 12} textAnchor="middle" fontSize={9} className="fill-zinc-400 calcdark:fill-zinc-500">
              {t}
            </text>
          ))}
          {TICKS.map((t) => (
            <text key={`ly-${t}`} x={xToPixel(0) - 6} y={yToPixel(t) + 3} textAnchor="end" fontSize={9} className="fill-zinc-400 calcdark:fill-zinc-500">
              {t}
            </text>
          ))}

          {/* curve */}
          {segments.map((segment, i) => (
            <polyline
              key={i}
              points={segment.map((p) => `${xToPixel(p.x)},${yToPixel(p.y)}`).join(" ")}
              fill="none"
              className="stroke-blue-500 calcdark:stroke-blue-400"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>

      <p className="text-center text-xs text-zinc-400 calcdark:text-zinc-500">{tHome("graph.rangeCaption")}</p>
    </div>
  );
}
