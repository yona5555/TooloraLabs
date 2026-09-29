"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

/** Type #16 (Side-by-Side Comparison Cards): the calculator's two built-in constant keys, same card structure, each with its value, defining property, and one real use inside this calculator. */
export default function MathConstantsCards() {
  const t = useTranslations("tools.scientific-calculator.education.functions.constants");

  const cards = [
    { key: "pi", symbol: "π", value: Math.PI.toFixed(6), defLabel: t("pi.def"), useLabel: t("pi.use") },
    { key: "e", symbol: "e", value: Math.E.toFixed(6), defLabel: t("e.def"), useLabel: t("e.use") },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.key} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{c.symbol}</p>
            <p className="mt-1 font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-100">{c.value}</p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{c.defLabel}</p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{c.useLabel}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: "π", value: Math.PI.toFixed(8) },
            { label: "e", value: Math.E.toFixed(8) },
          ]}
        />
      </div>
    </SectionCard>
  );
}
