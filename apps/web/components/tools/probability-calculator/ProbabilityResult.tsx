"use client";
import { useTranslations } from "next-intl";
import { oddsFromProbability } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import ProbabilityLive3D from "./ProbabilityLive3D";
import ProbabilityShareExportModal from "./ProbabilityShareExportModal";
import { MODE_FIELDS, useProbabilityModel } from "./ProbabilityLiveContext";

/** Result card: the calculated probability up top, then the deep live table beside the 100-cube outcome grid. */
export default function ProbabilityResult({ className = "" }: { className?: string }) {
  const t = useTranslations("tools.probability-calculator.result");
  const tf = useTranslations("tools.probability-calculator.form.fields");
  const { mode, fields, valid, r, symbol, f, pct } = useProbabilityModel();
  const odds = oddsFromProbability(r);

  const inputRows = MODE_FIELDS[mode].map((k) => ({ label: tf(k), value: fields[k] }));
  const resultRows = [
    { label: t("probability"), value: f(r, 4) },
    { label: t("oddsFor"), value: `${f(odds.oddsFor, 3)} : 1` },
    { label: t("oddsAgainst"), value: `${f(odds.oddsAgainst, 3)} : 1` },
  ];

  return (
    <SectionCard
      title={t("heading")}
      className={`flex flex-col lg:h-full ${className}`}
      bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
      action={
        valid ? (
          <ProbabilityShareExportModal
            inputRows={inputRows}
            resultRows={resultRows}
            heroLabel={t("percentage")}
            heroValue={pct(r)}
            sentence={t("sentence", { probability: f(r, 4), percentage: f(r * 100, 4) })}
          />
        ) : undefined
      }
    >
      {valid ? (
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-blue-50 px-3 py-2 dark:bg-blue-500/10">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">{t("percentage")}</p>
            <p dir="ltr" className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">{`${symbol} = ${pct(r)}`}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t("probability")}</p>
            <p dir="ltr" className="font-mono text-2xl font-bold text-zinc-800 dark:text-zinc-100">{f(r, 4)}</p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{t(`invalid.${mode}`)}</p>
      )}
      <div className="mt-4 flex flex-1 flex-col border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <LiveTableFill>
          <ProbabilityLive3D />
        </LiveTableFill>
      </div>
    </SectionCard>
  );
}
