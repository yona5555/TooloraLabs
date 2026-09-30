"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Type #16 (Side-by-Side Comparison Cards): a defined/counted number (infinite significant figures, never limits a calculation) next to a measured number (limited precision, always the bottleneck) — same card structure, genuinely different category. */
export default function ExactNumbersVsMeasuredNumbers() {
  const t = useTranslations("tools.significant-figures-calculator.education.exactVsMeasured");

  const cards = [
    { key: "exact", value: "12", unitLabel: t("exact.unit"), sigFigsLabel: t("exact.sigFigs") },
    { key: "measured", value: "12.0", unitLabel: t("measured.unit"), sigFigsLabel: t("measured.sigFigs") },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.key} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{t(`${c.key}.title`)}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">{c.value}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{c.unitLabel}</p>
            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{c.sigFigsLabel}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("note")}</p>
    </SectionCard>
  );
}
