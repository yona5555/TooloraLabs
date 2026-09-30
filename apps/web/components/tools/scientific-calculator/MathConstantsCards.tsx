"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScientificCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const tool = new ScientificCalculator();
const PHI = (1 + Math.sqrt(5)) / 2;

/** Type #16 (Side-by-Side Comparison Cards): a live precision slider reveals more digits of four real constants at once — √2 computed live through the calculator's own sqrt() operation, the other three from their defining formulas. */
export default function MathConstantsCards() {
  const t = useTranslations("tools.scientific-calculator.education.mathConstants");
  const [precision, setPrecision] = useState(4);

  const sqrt2Out = tool.execute({ operation: "sqrt", a: 2 }, { locale: "en-US" });
  if (!sqrt2Out.success) return null;

  const constants = [
    { key: "pi", symbol: "π", value: Math.PI },
    { key: "e", symbol: "e", value: Math.E },
    { key: "phi", symbol: "φ", value: PHI },
    { key: "sqrt2", symbol: "√2", value: sqrt2Out.data.result },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mx-auto mt-4 max-w-sm">
        <input type="range" min={0} max={10} step={1} value={precision} onChange={(e) => setPrecision(Number(e.target.value))} className="w-full accent-blue-600 dark:accent-blue-400" aria-label={t("sliderLabel")} />
        <p className="mt-1 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">{`${t("precisionLabel")}: ${precision}`}</p>
      </div>
      <div dir="ltr" className="mt-4 grid grid-cols-2 gap-3">
        {constants.map((c) => (
          <div key={c.key} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{c.symbol}</p>
            <p className="mt-1 break-all font-mono text-sm text-zinc-700 dark:text-zinc-200">{c.value.toFixed(precision)}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={constants.map((c) => ({ label: t(`names.${c.key}`), value: c.value.toFixed(precision) }))} />
      </div>
    </SectionCard>
  );
}
