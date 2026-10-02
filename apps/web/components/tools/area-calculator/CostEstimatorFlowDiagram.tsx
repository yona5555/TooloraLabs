"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, computeAreaFor, round } from "./areaEducationMath";

const PRICES = [8, 15, 25, 40] as const;

/** Type #2 (Flow Arrow with Embedded Numbers): the live area multiplied by a real per-unit-area price — a practical "what would covering this actually cost" question, with the price itself a live embedded control. */
export default function CostEstimatorFlowDiagram() {
  const t = useTranslations("tools.area-calculator.education.costEstimator");
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const area = computeAreaFor(n);
  const [price, setPrice] = useState<number>(15);
  const total = area * price;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {PRICES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrice(p)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${p === price ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
              >
                {`$${p}`}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-center">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
              <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{round(area)}</p>
              <p className="text-xs text-zinc-400">{t("areaLabel")}</p>
            </div>
            <ArrowRight className="shrink-0 text-blue-500" size={20} />
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
              <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`× $${price}`}</p>
              <p className="text-xs text-blue-500/80">{t("priceLabel")}</p>
            </div>
            <ArrowRight className="shrink-0 text-blue-500" size={20} />
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{`$${round(total)}`}</p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("totalLabel")}</p>
            </div>
          </div>
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: `${round(area)} × $${price} = $${round(total)}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
