"use client";
import { useTranslations } from "next-intl";
import { countDecimalPlaces, countSignificantFigures } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

/** Type #16 (Side-by-Side Comparison Cards): the live A's own decimal-place count and significant-figure count — two genuinely different measures of precision that only sometimes agree. */
export default function DecimalPlacesVsSigFigsComparison() {
  const t = useTranslations("tools.significant-figures-calculator.education.decimalVsSigFigs");
  const { dims } = useSignificantFiguresLive();
  const decimalPlaces = countDecimalPlaces(dims.rawValueA);
  const sigFigs = countSignificantFigures(dims.rawValueA);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: dims.rawValueA })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="grid shrink-0 grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{t("decimalPlacesLabel")}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">{decimalPlaces}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500 dark:text-emerald-400">{t("sigFigsLabel")}</p>
            <p className="mt-2 font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-300">{sigFigs}</p>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[{ label: t("worked.sameCount"), value: decimalPlaces === sigFigs ? t("worked.yes") : t("worked.no"), emphasize: true, note: t("worked.note") }]}
        />
      </div>
    </SectionCard>
  );
}
