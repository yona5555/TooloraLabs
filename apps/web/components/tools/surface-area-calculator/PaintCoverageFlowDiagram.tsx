"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, computeSurfaceAreaFor, round } from "./surfaceAreaEducationMath";
import GapFreeRow from "@/components/tool-ui/GapFreeRow";

const COVERAGE = [8, 10, 12] as const;

/** Type #2 (Flow Arrow with Embedded Numbers): the live surface area divided by a real paint can's coverage rate — a practical "how many cans would this actually take" question, with the coverage rate itself a live embedded control. */
export default function PaintCoverageFlowDiagram() {
  const t = useTranslations("tools.surface-area-calculator.education.paintCoverage");
  const { dims } = useSurfaceAreaLive();
  const n = parseSurfaceDims(dims);
  const area = computeSurfaceAreaFor(n);
  const [coverage, setCoverage] = useState<number>(10);
  const cans = Math.ceil(area / coverage);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <GapFreeRow className="mt-4">
        <div dir="ltr" className="flex shrink-0 flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {COVERAGE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCoverage(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${c === coverage ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
              >
                {`${c} m²/can`}
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
              <p className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`÷ ${coverage}`}</p>
              <p className="text-xs text-blue-500/80 max-md:text-blue-600">{t("coverageLabel")}</p>
            </div>
            <ArrowRight className="shrink-0 text-blue-500" size={20} />
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{cans}</p>
              <p className="text-xs text-emerald-600/80 max-md:text-emerald-600 dark:text-emerald-400/80">{t("cansLabel")}</p>
            </div>
          </div>
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.formula"), value: `${round(area)} ÷ ${coverage} = ${cans}`, emphasize: true }]} />
      </GapFreeRow>
    </SectionCard>
  );
}
