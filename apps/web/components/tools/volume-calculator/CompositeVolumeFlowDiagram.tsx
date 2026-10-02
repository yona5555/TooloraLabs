"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useVolumeLive } from "./VolumeLiveContext";
import { parseVolumeDims, computeVolumeFor, round } from "./volumeEducationMath";

const COUNTS = [2, 3, 4, 6] as const;

/** Type #3 (Hierarchical Flow): the live solid's own real volume, multiplied by how many identical copies a real storage or packaging job would actually need — the copy count itself a live embedded control. */
export default function CompositeVolumeFlowDiagram() {
  const t = useTranslations("tools.volume-calculator.education.compositeFlow");
  const tShape = useTranslations("tools.volume-calculator.form");
  const { dims } = useVolumeLive();
  const n = parseVolumeDims(dims);
  const volume = computeVolumeFor(n);
  const [count, setCount] = useState<number>(3);
  const total = volume * count;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { shape: tShape(`shape.${dims.shape}`) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {COUNTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCount(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${c === count ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
              >
                {t("countChip", { count: c })}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-center">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/40">
              <p className="font-mono text-lg font-bold text-zinc-800 dark:text-zinc-100">{round(volume)}</p>
              <p className="text-xs text-zinc-400">{t("oneLabel")}</p>
            </div>
            <ArrowRight className="shrink-0 text-blue-500" size={20} />
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
              <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`× ${count}`}</p>
              <p className="text-xs text-blue-500/80">{t("countLabel")}</p>
            </div>
            <ArrowRight className="shrink-0 text-blue-500" size={20} />
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{round(total)}</p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("totalLabel")}</p>
            </div>
          </div>
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: `${round(volume)} × ${count} = ${round(total)}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
