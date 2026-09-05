"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Static, illustrative concept diagram — a fixed example (12 = 2² × 3, 18 = 2 × 3²) laid out
 * as a Venn diagram of prime factors. The overlap (shared factors, one copy of each) is the
 * GCF; every factor from both circles combined (shared factors counted once, at their higher
 * power) is the LCM.
 */
export default function GcfLcmConceptDiagram() {
  const d = useTranslations("tools.gcf-lcm-calculator.aboveFold.conceptDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox="0 0 480 260" role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-md text-current">
          <circle cx="190" cy="130" r="110" className="fill-blue-500/15 stroke-blue-600 dark:fill-blue-400/15 dark:stroke-blue-300" strokeWidth={2} />
          <circle cx="290" cy="130" r="110" className="fill-amber-500/15 stroke-amber-600 dark:fill-amber-400/15 dark:stroke-amber-300" strokeWidth={2} />

          <text x="130" y="80" fontSize={13} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
            12
          </text>
          <text x="130" y="100" fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.7} fontFamily="monospace">
            2 × 2
          </text>

          <text x="350" y="80" fontSize={13} fontWeight={700} textAnchor="middle" className="fill-amber-700 dark:fill-amber-300">
            18
          </text>
          <text x="350" y="100" fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.7} fontFamily="monospace">
            3 × 3
          </text>

          <text x="240" y="125" fontSize={13} fontWeight={700} textAnchor="middle" fill="currentColor">
            {d("sharedLabel")}
          </text>
          <text x="240" y="145" fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.7} fontFamily="monospace">
            2 × 3
          </text>

          <text x="240" y="220" fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
            GCF = 6
          </text>
          <text x="240" y="242" fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
            LCM = 2 × 2 × 3 × 3 = 36
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
