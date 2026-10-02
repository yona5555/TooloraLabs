"use client";
import { useTranslations } from "next-intl";
import { countSignificantFigures } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

/** Type #5 (Ranked Horizontal Bar List): the live A and B ranked by real precision — whichever has fewer significant figures is the less precise measurement, regardless of which number looks bigger. */
export default function PrecisionRankedComparison() {
  const t = useTranslations("tools.significant-figures-calculator.education.precisionRanked");
  const { dims } = useSignificantFiguresLive();
  if (dims.rawValueB.trim() === "") return null;

  const rows = [
    { key: "a", label: "A", raw: dims.rawValueA, sigFigs: countSignificantFigures(dims.rawValueA) },
    { key: "b", label: "B", raw: dims.rawValueB, sigFigs: countSignificantFigures(dims.rawValueB) },
  ].sort((x, y) => y.sigFigs - x.sigFigs);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full space-y-2 lg:flex-1">
          {rows.map((r, i) => (
            <div key={r.key} className="flex items-center gap-3">
              <span className="w-16 shrink-0 font-mono text-sm font-semibold text-zinc-600 dark:text-zinc-300">{`${r.label}: ${r.raw}`}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <div className={`flex h-full items-center justify-end pe-2 text-xs font-bold text-white transition-all duration-300 ${i === 0 ? "bg-blue-600" : "bg-zinc-400 dark:bg-zinc-600"}`} style={{ width: `${(r.sigFigs / 8) * 100}%` }}>
                  {r.sigFigs}
                </div>
              </div>
            </div>
          ))}
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.morePrecise"), value: rows[0].label, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
