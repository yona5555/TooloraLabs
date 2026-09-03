"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const VIEW_W = 880;
const VIEW_H = 280;

/**
 * Static, illustrative concept diagram — fixed example dimensions (not the user's live
 * inputs) on a cube and a cylinder, showing why surface area is a *sum of faces*: the
 * cube's net unfolds into six flat squares, and the cylinder's curved side unrolls into
 * a flat rectangle once you cut along its height, capped by two circles.
 */
export default function SurfaceAreaConceptDiagram() {
  const t = useTranslations("tools.surface-area-calculator.aboveFold");
  const d = useTranslations("tools.surface-area-calculator.aboveFold.conceptDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-3xl text-current">
          {/* Cube net: a plus-shape of six unfolded squares */}
          <g transform="translate(50,40)" className="fill-blue-600/20 stroke-blue-700 dark:fill-blue-400/20 dark:stroke-blue-300" strokeWidth={2}>
            {[
              [50, 0],
              [0, 50],
              [50, 50],
              [100, 50],
              [150, 50],
              [50, 100],
            ].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width={50} height={50} />
            ))}
          </g>
          <text x="125" y="200" fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
            6 × {t("sideLabel")}²
          </text>
          <text x="125" y="222" fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.55}>
            {d("cubeCaption")}
          </text>

          {/* Cylinder unroll: two circles (top/bottom) + a rectangle (the unrolled side) */}
          <g transform="translate(430,40)">
            <ellipse cx="40" cy="20" rx="38" ry="16" className="fill-amber-500/20 stroke-amber-600 dark:fill-amber-400/20 dark:stroke-amber-300" strokeWidth={2} />
            <text x="40" y="24" fontSize={11} textAnchor="middle" fill="currentColor" opacity={0.7}>
              πr²
            </text>

            <rect x="0" y="52" width="300" height="70" className="fill-amber-500/15 stroke-amber-600 dark:fill-amber-400/15 dark:stroke-amber-300" strokeWidth={2} />
            <line x1="0" y1="87" x2="300" y2="87" stroke="currentColor" strokeWidth={1} opacity={0.3} strokeDasharray="4 4" />
            <text x="150" y="92" fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
              2πr × {t("heightLabel")}
            </text>

            <ellipse cx="40" cy="140" rx="38" ry="16" className="fill-amber-500/20 stroke-amber-600 dark:fill-amber-400/20 dark:stroke-amber-300" strokeWidth={2} />
            <text x="40" y="144" fontSize={11} textAnchor="middle" fill="currentColor" opacity={0.7}>
              πr²
            </text>
          </g>
          <text x="580" y="200" fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
            2πr² + 2πr × h
          </text>
          <text x="580" y="222" fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.55}>
            {d("cylinderCaption")}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
