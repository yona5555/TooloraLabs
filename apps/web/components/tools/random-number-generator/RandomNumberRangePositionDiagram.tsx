"use client";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

type Props = {
  numbers: number[];
  min: number;
  max: number;
  average: number;
  digitStyle: DigitStyle;
  averageLabel: string;
  caption: string;
};

const LINE_WIDTH = 260;
const LINE_Y = 30;

/**
 * A real, live position map of the actual numbers this run generated — not a
 * decorative number line. Every dot is one of the generated values plotted
 * at its true position within [min, max]; the average marker uses the same
 * real average shown in the stats list beneath it.
 */
export default function RandomNumberRangePositionDiagram({ numbers, min, max, average, digitStyle, averageLabel, caption }: Props) {
  if (numbers.length === 0 || !(max > min)) return null;

  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });
  const toX = (value: number) => 20 + ((value - min) / (max - min)) * LINE_WIDTH;
  const avgX = toX(Math.min(Math.max(average, min), max));

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${LINE_WIDTH + 40} 70`} width="100%" className="max-w-full" style={{ minWidth: 260 }}>
          <line x1={20} y1={LINE_Y} x2={20 + LINE_WIDTH} y2={LINE_Y} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth={2} />
          <line x1={20} y1={LINE_Y - 5} x2={20} y2={LINE_Y + 5} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth={2} />
          <line x1={20 + LINE_WIDTH} y1={LINE_Y - 5} x2={20 + LINE_WIDTH} y2={LINE_Y + 5} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth={2} />

          <text x={20} y={LINE_Y + 20} textAnchor="start" className="fill-zinc-500 dark:fill-zinc-400" style={{ fontSize: 9 }}>
            {fmt(min)}
          </text>
          <text x={20 + LINE_WIDTH} y={LINE_Y + 20} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400" style={{ fontSize: 9 }}>
            {fmt(max)}
          </text>

          <line x1={avgX} y1={LINE_Y - 14} x2={avgX} y2={LINE_Y + 14} className="stroke-amber-500 dark:stroke-amber-400" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={avgX} y={LINE_Y - 18} textAnchor="middle" className="fill-amber-600 dark:fill-amber-400" style={{ fontSize: 8, fontWeight: 700 }}>
            {averageLabel}
          </text>

          {numbers.map((n, i) => {
            const x = toX(Math.min(Math.max(n, min), max));
            return <circle key={i} cx={x} cy={LINE_Y} r={4} className="fill-blue-600 dark:fill-blue-400" opacity={0.85} />;
          })}
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
