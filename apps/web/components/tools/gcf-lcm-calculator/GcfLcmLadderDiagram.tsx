"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * The "ladder" (a.k.a. birthday-cake) method: repeatedly divide both numbers
 * by a common prime factor, writing that prime to the side, until the two
 * numbers share no more common factors. GCF is the product of the primes
 * used; LCM is the product of the primes used times the two numbers left at
 * the bottom. A fixed example (12, 18) distinct from GcfLcmConceptDiagram's
 * Venn-diagram framing of the same numbers — this shows the mechanical
 * procedure, not just the end result.
 */
const ROWS = [
  { prime: 2, left: 12, right: 18 },
  { prime: 3, left: 6, right: 9 },
];
const FINAL = { left: 2, right: 3 };

export default function GcfLcmLadderDiagram() {
  const d = useTranslations("tools.gcf-lcm-calculator.ladderDiagram");

  const rowHeight = 40;
  const height = (ROWS.length + 1) * rowHeight + 56;

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 240 ${height}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-[220px] text-current">
          <path d={`M 40 10 L 40 ${height - 30} L 200 ${height - 30}`} fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />

          {ROWS.map((row, i) => (
            <g key={i}>
              <text x={20} y={i * rowHeight + 25} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-amber-700 dark:fill-amber-300">
                {row.prime}
              </text>
              <text x={100} y={i * rowHeight + 25} fontSize={13} textAnchor="middle" fill="currentColor" fontFamily="monospace">
                {row.left}
              </text>
              <text x={170} y={i * rowHeight + 25} fontSize={13} textAnchor="middle" fill="currentColor" fontFamily="monospace">
                {row.right}
              </text>
            </g>
          ))}

          <text x={100} y={ROWS.length * rowHeight + 25} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300" fontFamily="monospace">
            {FINAL.left}
          </text>
          <text x={170} y={ROWS.length * rowHeight + 25} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300" fontFamily="monospace">
            {FINAL.right}
          </text>

          <text x={120} y={height - 34} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
            GCF = 2 × 3 = 6
          </text>
          <text x={120} y={height - 12} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
            LCM = 6 × 2 × 3 = 36
          </text>
        </svg>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}
