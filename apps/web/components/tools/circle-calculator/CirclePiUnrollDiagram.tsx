"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * The classic "unroll the circumference" proof sketch: a circle's rim laid
 * out flat measures exactly π diameters — three full diameters plus a small
 * ~0.14 remainder. Fixed illustrative diameter (not the live solved value,
 * unlike CircleDiagram), since the point is the π ratio itself, which is
 * constant regardless of the circle's actual size.
 */
export default function CirclePiUnrollDiagram() {
  const d = useTranslations("tools.circle-calculator.piDiagram");

  const D = 56; // illustrative diameter length in SVG units
  const barY = 170;
  const startX = 30;

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox="0 0 400 210" role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-md text-current">
          <circle cx="80" cy="70" r={D / 2} className="fill-blue-500/15 stroke-blue-600 dark:fill-blue-400/15 dark:stroke-blue-300" strokeWidth={2} />
          <line x1="80" y1="70" x2={80 + D / 2} y2="70" strokeWidth={2} strokeDasharray="3 2" className="stroke-blue-700 dark:stroke-blue-300" />
          <path d={`M 30 130 Q 80 155 30 165`} fill="none" strokeWidth={1.5} strokeDasharray="2 3" className="stroke-current opacity-40" />

          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={startX + i * D}
              y={barY - 10}
              width={D}
              height={20}
              className="fill-blue-500/20 stroke-blue-600 dark:fill-blue-400/20 dark:stroke-blue-300"
              strokeWidth={1.5}
            />
          ))}
          <rect x={startX + 3 * D} y={barY - 10} width={D * 0.1416} height={20} className="fill-amber-500/30 stroke-amber-600 dark:fill-amber-400/30 dark:stroke-amber-300" strokeWidth={1.5} />

          {[0, 1, 2].map((i) => (
            <text key={i} x={startX + i * D + D / 2} y={barY + 28} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.75}>
              d
            </text>
          ))}
          <text x={startX + 3 * D + D * 0.07} y={barY + 28} fontSize={11} textAnchor="middle" className="fill-amber-700 dark:fill-amber-300">
            0.14d
          </text>

          <text x="200" y="30" fontSize={14} fontWeight={700} textAnchor="middle" fill="currentColor">
            C = π × d
          </text>
        </svg>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}
