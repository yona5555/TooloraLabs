"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type RetirementMilestonesCardProps = {
  currentAge: number;
};

const MILESTONES = [
  { age: 30, multiple: 1 },
  { age: 40, multiple: 3 },
  { age: 50, multiple: 6 },
  { age: 60, multiple: 8 },
  { age: 67, multiple: 10 },
];

/**
 * Widely cited age-based "salary multiple saved" savings benchmarks, with the milestone closest
 * to the current-age input highlighted. Fills the gap that opens up below the mode tabs once the
 * (longer) input column runs past the result card, with content that's genuinely useful alongside
 * — rather than a duplicate of — the tool's own projection.
 */
export default function RetirementMilestonesCard({ currentAge }: RetirementMilestonesCardProps) {
  const t = useTranslations("tools.retirement-calculator.aboveFold");

  const closestAge = MILESTONES.reduce((closest, m) => (Math.abs(m.age - currentAge) < Math.abs(closest - currentAge) ? m.age : closest), MILESTONES[0].age);

  return (
    <SectionCard title={t("milestonesCardTitle")}>
      <ul className="flex flex-col gap-2">
        {MILESTONES.map((m) => {
          const active = m.age === closestAge;
          return (
            <li
              key={m.age}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400"
              }`}
            >
              <span>{t("milestonesCardRow", { age: m.age })}</span>
              <span dir="ltr" className="font-mono font-semibold">
                {m.multiple}×
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">{t("milestonesCardNote")}</p>
    </SectionCard>
  );
}
