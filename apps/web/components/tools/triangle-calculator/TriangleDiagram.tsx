"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { TriangleResult, TrianglePoint } from "./types";

type Props = {
  result: TriangleResult;
  digitStyle: DigitStyle;
};

const BOX = 220;
const PAD = 30;

/**
 * A live sketch of the actual solved triangle, redrawn to scale from its three real vertices
 * on every input change — not a fixed illustration of "a" triangle. SVG y-axis grows downward,
 * so vertex y-coordinates are flipped when plotting to match the upright orientation a reader
 * expects.
 */
export default function TriangleDiagram({ result, digitStyle }: Props) {
  const t = useTranslations("tools.triangle-calculator.diagram");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  if (!result.valid) return null;

  const [A, B, C] = result.vertices;
  const xs = [A.x, B.x, C.x];
  const ys = [A.y, B.y, C.y];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = BOX / Math.max(spanX, spanY);

  const project = (p: TrianglePoint) => ({
    x: PAD + (p.x - minX) * scale,
    y: PAD + (maxY - p.y) * scale,
  });

  const pA = project(A);
  const pB = project(B);
  const pC = project(C);
  const W = BOX + PAD * 2;
  const H = Math.min(spanY, spanX) === spanY ? BOX + PAD * 2 : (spanY / spanX) * BOX + PAD * 2;

  const labelOffset = (p: { x: number; y: number }, cx: number, cy: number) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / len) * 14, y: p.y + (dy / len) * 14 };
  };
  const centroid = { x: (pA.x + pB.x + pC.x) / 3, y: (pA.y + pB.y + pC.y) / 3 };
  const labelA = labelOffset(pA, centroid.x, centroid.y);
  const labelB = labelOffset(pB, centroid.x, centroid.y);
  const labelC = labelOffset(pC, centroid.x, centroid.y);

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t("ariaLabel")}: a=${fmt(result.a)}, b=${fmt(result.b)}, c=${fmt(result.c)}`} className="mx-auto block w-full max-w-[260px]">
        <polygon
          points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`}
          className="fill-blue-500/15 stroke-blue-600 dark:fill-blue-400/15 dark:stroke-blue-300"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <text x={labelA.x} y={labelA.y} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
          A
        </text>
        <text x={labelB.x} y={labelB.y} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
          B
        </text>
        <text x={labelC.x} y={labelC.y} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
          C
        </text>
      </svg>
    </div>
  );
}
