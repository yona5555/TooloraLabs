"use client";
import { useTranslations } from "next-intl";
import { independenceCheck, oddsFromProbability } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import ProbabilityLive3D from "./ProbabilityLive3D";
import ProbabilityShareExportModal from "./ProbabilityShareExportModal";
import { MODE_FIELDS, useProbabilityModel } from "./ProbabilityLiveContext";

/** Result card: the calculated probability up top, then the deep live table beside the 100-cube outcome grid. */
export default function ProbabilityResult({ className = "" }: { className?: string }) {
  const t = useTranslations("tools.probability-calculator.result");
  const tf = useTranslations("tools.probability-calculator.form.fields");
  const { mode, fields, valid, r, b, symbol, f, pct } = useProbabilityModel();
  const odds = oddsFromProbability(r);
  const ind = independenceCheck(b);
  const bGivenA = Number.isFinite(b.bGivenA) ? pct(b.bGivenA) : "—";
  const verdict = t(ind.independent ? "verdict.independent" : "verdict.dependent");
  // Conditional mode: P(A) drives P(B|A) and the independence test, not just the Venn picture.
  const conditionalRows =
    mode === "conditional"
      ? [
          { label: t("bGivenA"), formula: `${pct(b.pAB)} / ${pct(b.pA)}`, value: bGivenA },
          { label: t("product"), formula: `${pct(b.pA)} × ${pct(b.pB)}`, value: pct(ind.product) },
          { label: t("independence"), formula: `${pct(b.pAB)} ${ind.independent ? "=" : "≠"} ${pct(ind.product)}`, value: verdict },
        ]
      : [];

  const inputRows = MODE_FIELDS[mode].map((k) => ({ label: tf(k), value: fields[k] }));
  const resultRows = [
    { label: t("probability"), value: f(r, 4) },
    { label: t("oddsFor"), value: `${f(odds.oddsFor, 3)} : 1` },
    { label: t("oddsAgainst"), value: `${f(odds.oddsAgainst, 3)} : 1` },
    ...conditionalRows.map(({ label, value }) => ({ label, value })),
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
      ) : null}
      {valid && conditionalRows.length > 0 ? (
        <table className="mt-3 w-full overflow-hidden rounded-xl text-sm">
          <tbody>
            {conditionalRows.map((row, i) => (
              <tr key={row.label} className={i % 2 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800/50"}>
                <th scope="row" className="px-3 py-1.5 text-start font-semibold text-zinc-600 dark:text-zinc-300">{row.label}</th>
                <td dir="ltr" className="px-2 py-1.5 text-center font-mono text-xs whitespace-nowrap text-zinc-500 dark:text-zinc-400">{row.formula}</td>
                <td
                  dir="auto"
                  className={`px-3 py-1.5 text-end font-bold whitespace-nowrap ${i === 2 ? "" : "font-mono"} ${
                    i === 2 ? (ind.independent ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400") : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {valid ? null : (
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
