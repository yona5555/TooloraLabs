"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScientificCalculator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const tool = new ScientificCalculator();

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #2 (Flow Arrow with Embedded Numbers): two live sliders — a base value and a percent — feed the calculator's real percent() operation, the same one its % key calls. */
export default function PercentFlowDiagram() {
  const t = useTranslations("tools.scientific-calculator.education.percentFlow");
  const [base, setBase] = useState(240);
  const [percent, setPercent] = useState(15);

  const output = tool.execute({ operation: "percent", a: base, b: percent }, { locale: "en-US" });
  if (!output.success) return null;
  const result = round2(output.data.result);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <div dir="ltr" className="mx-auto max-w-sm space-y-3">
            <div>
              <input type="range" min={1} max={1000} step={1} value={base} onChange={(e) => setBase(Number(e.target.value))} className="w-full accent-blue-600 dark:accent-blue-400" aria-label={t("baseSliderLabel")} />
              <p className="mt-1 text-center text-xs font-semibold text-blue-700 dark:text-blue-300">{`${t("baseLabel")}: ${base}`}</p>
            </div>
            <div>
              <input type="range" min={0} max={100} step={1} value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="w-full accent-emerald-600 dark:accent-emerald-400" aria-label={t("percentSliderLabel")} />
              <p className="mt-1 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">{`${percent}%`}</p>
            </div>
          </div>
          <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
              <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{base}</p>
            </div>
            <ArrowRight className="shrink-0 text-blue-500" size={20} />
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
              <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`× ${percent}%`}</p>
            </div>
            <ArrowRight className="shrink-0 text-blue-500" size={20} />
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{result}</p>
            </div>
          </div>
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: `${base} × ${percent}% = ${result}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
