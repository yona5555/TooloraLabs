"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { countSignificantFigures } from "@tooloralabs/tools";

const CANDIDATES = [
  { form: "1500", sci: null },
  { form: "1.5×10³", sci: "1.5" },
  { form: "1.50×10³", sci: "1.50" },
  { form: "1.500×10³", sci: "1.500" },
];

/** Type #19 (Zone Strip): "1500" alone is genuinely ambiguous (2, 3, or 4 sig figs, no way to tell) — the three scientific-notation rewrites next to it each resolve the ambiguity completely, landing at different fixed points. */
export default function AmbiguousTrailingZerosZone() {
  const t = useTranslations("tools.significant-figures-calculator.education.ambiguousZeros");
  const counts = CANDIDATES.map((c) => (c.sci ? countSignificantFigures(c.sci) : null));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-8 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100 to-emerald-200 dark:from-amber-500/15 dark:to-emerald-500/25" />
          {[2, 3, 4].map((n) => (
            <div key={n} className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 dark:border-zinc-900" style={{ left: `${((n - 2) / 2) * 80 + 10}%` }} />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>2 sf</span>
          <span>3 sf</span>
          <span>4 sf</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={CANDIDATES.map((c, i) => ({ label: c.form, value: counts[i] ? t("worked.count", { count: counts[i] }) : t("worked.ambiguous"), emphasize: i === 0 }))}
        />
      </div>
    </SectionCard>
  );
}
