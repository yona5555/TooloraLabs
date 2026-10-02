"use client";
import { useTranslations } from "next-intl";
import { countSignificantFigures, roundToSigFigs } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

const EXACT_COUNT = "12";

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Type #16 (Side-by-Side Comparison Cards): the live A treated as a real measurement with
 * limited significant figures, multiplied by an exact count (12, with infinite implied
 * precision) — the exact number never limits the result's own precision. The calculator's own
 * multiply operation has no concept of "exact" inputs, so the limiting rule here is applied
 * directly with the real exported roundToSigFigs — sigFigsA alone, not min(sigFigsA, sigFigsB).
 */
export default function ExactNumbersVsMeasuredNumbers() {
  const t = useTranslations("tools.significant-figures-calculator.education.exactVsMeasured");
  const { dims } = useSignificantFiguresLive();
  const numericA = Number(dims.rawValueA);
  if (dims.rawValueA.trim() === "" || !Number.isFinite(numericA)) return null;
  const sigFigsA = countSignificantFigures(dims.rawValueA);
  const rawProduct = numericA * Number(EXACT_COUNT);
  const result = roundToSigFigs(rawProduct, sigFigsA);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: dims.rawValueA })}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{t("measuredLabel")}</p>
          <p className="mt-2 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{dims.rawValueA}</p>
          <p className="mt-1 text-xs text-blue-600/80 dark:text-blue-400/80">{t("sigFigsCount", { count: sigFigsA })}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500 dark:text-emerald-400">{t("exactLabel")}</p>
          <p className="mt-2 font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{EXACT_COUNT}</p>
          <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("infinitePrecision")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.rawProduct"), value: `${round3(rawProduct)}` },
            { label: t("worked.result"), value: `${round3(result)}`, emphasize: true, note: t("worked.limitedByMeasured") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
