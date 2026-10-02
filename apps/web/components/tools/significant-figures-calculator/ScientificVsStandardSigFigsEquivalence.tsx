"use client";
import { useTranslations } from "next-intl";
import { countSignificantFigures } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

function toScientificString(value: number, sigFigs: number): string {
  if (value === 0) return "0";
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const coefficient = value / 10 ** exponent;
  return `${coefficient.toFixed(Math.max(0, sigFigs - 1))} × 10^${exponent}`;
}

/** Type #11 (Side-by-Side Equivalence): the live A, in its own written standard form next to the real scientific-notation form that removes all ambiguity about how many figures were actually intended. */
export default function ScientificVsStandardSigFigsEquivalence() {
  const t = useTranslations("tools.significant-figures-calculator.education.scientificEquivalence");
  const { dims } = useSignificantFiguresLive();
  const numericA = Number(dims.rawValueA);
  if (dims.rawValueA.trim() === "" || !Number.isFinite(numericA) || numericA === 0) return null;
  const sigFigs = countSignificantFigures(dims.rawValueA);
  const scientific = toScientificString(numericA, sigFigs);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("standardLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-zinc-700 dark:text-zinc-200">{dims.rawValueA}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{t("scientificLabel")}</p>
          <p className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{scientific}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.sigFigs"), value: `${sigFigs}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
