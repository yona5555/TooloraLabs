"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Fixed illustrative example (3/4 as a pie) — a second, visually distinct
 * representation of "what a fraction is" alongside the live FractionBarDiagram,
 * since pie slices are the more familiar mental model for many people than a
 * segmented bar even though they encode the same information.
 */
const NUMERATOR = 3;
const DENOMINATOR = 4;

export default function FractionPieDiagram() {
  const d = useTranslations("tools.fraction-calculator.pieDiagram");

  const R = 70;
  const CX = 90;
  const CY = 90;
  const sliceAngle = 360 / DENOMINATOR;

  function arcPoint(angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  }

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox="0 0 180 180" role="img" aria-label={d("ariaLabel", { numerator: NUMERATOR, denominator: DENOMINATOR })} className="mx-auto block w-full max-w-[200px] text-current">
          {Array.from({ length: DENOMINATOR }, (_, i) => {
            const start = arcPoint(i * sliceAngle);
            const end = arcPoint((i + 1) * sliceAngle);
            const isShaded = i < NUMERATOR;
            return (
              <path
                key={i}
                d={`M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 0 1 ${end.x} ${end.y} Z`}
                fill={isShaded ? "currentColor" : "none"}
                className={isShaded ? "text-blue-600 dark:text-blue-400" : "text-current"}
                fillOpacity={isShaded ? 0.85 : 0}
                stroke="currentColor"
                strokeOpacity={0.4}
                strokeWidth={1.5}
              />
            );
          })}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />
        </svg>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">
        {d("caption", { fraction: `${NUMERATOR}/${DENOMINATOR}` })}
      </p>
    </SectionCard>
  );
}
