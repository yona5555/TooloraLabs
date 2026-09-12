"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * A fixed two-flip probability tree (fair coin, 2 flips) — the classic way
 * to show how probabilities multiply along branches: each path's probability
 * is the product of its edge labels, and the four leaf probabilities sum to 1.
 * Deliberately independent of ProbabilityBar/ProbabilityLikelihoodGauge, which
 * both visualize a single probability value rather than how one is built up
 * from combined independent events.
 */
const LEAVES = [
  { label: "HH", y: 30 },
  { label: "HT", y: 90 },
  { label: "TH", y: 150 },
  { label: "TT", y: 210 },
];

export default function ProbabilityTreeDiagram() {
  const d = useTranslations("tools.probability-calculator.treeDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox="0 0 320 240" role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-md text-current">
          <circle cx="20" cy="120" r="4" fill="currentColor" />

          <line x1="20" y1="120" x2="140" y2="60" stroke="currentColor" strokeOpacity={0.5} strokeWidth={1.5} />
          <line x1="20" y1="120" x2="140" y2="180" stroke="currentColor" strokeOpacity={0.5} strokeWidth={1.5} />
          <text x="72" y="80" fontSize={11} fill="currentColor" opacity={0.8}>
            H (1/2)
          </text>
          <text x="72" y="158" fontSize={11} fill="currentColor" opacity={0.8}>
            T (1/2)
          </text>
          <circle cx="140" cy="60" r="4" fill="currentColor" />
          <circle cx="140" cy="180" r="4" fill="currentColor" />

          {LEAVES.map((leaf, i) => {
            const fromY = i < 2 ? 60 : 180;
            return (
              <g key={leaf.label}>
                <line x1="140" y1={fromY} x2="230" y2={leaf.y} stroke="currentColor" strokeOpacity={0.5} strokeWidth={1.5} />
                <text x="178" y={(fromY + leaf.y) / 2 - 4} fontSize={11} fill="currentColor" opacity={0.8}>
                  {i % 2 === 0 ? "H (1/2)" : "T (1/2)"}
                </text>
                <circle cx="230" cy={leaf.y} r="4" fill="currentColor" />
                <text x="248" y={leaf.y + 4} fontSize={12} fontWeight={700} fill="currentColor" fontFamily="monospace">
                  {leaf.label}: 1/4
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}
