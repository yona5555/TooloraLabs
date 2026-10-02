"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

function countSigFigs(coefficient: number): number {
  const str = Math.abs(coefficient).toString().replace(".", "").replace(/^0+/, "");
  return str.length || 1;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #13-style annotated example: the live A's own coefficient has a real, unambiguous number of significant figures — exactly what gets lost the moment the same value is padded out into plain standard form with trailing zeros. */
export default function SignificantFiguresAmbiguity() {
  const t = useTranslations("tools.scientific-notation-converter.education.sigFigsAmbiguity");
  const { dims } = useScientificNotationLive();
  const a = deriveEffectiveA(dims);
  if (a.coefficient === 0) return null;

  const sigFigs = countSigFigs(a.coefficient);
  const exponent = Math.round(a.exponent);
  const standardForm = (a.coefficient * 10 ** exponent).toLocaleString("en-US", { maximumFractionDigits: 10 });
  const isAmbiguousCase = exponent >= 2;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 flex flex-wrap items-center justify-center gap-3 text-center">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-400">{`${round3(a.coefficient)} × 10^${exponent}`}</p>
            <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">{t("worked.unambiguous")}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="font-mono text-base font-bold text-amber-700 dark:text-amber-400">{standardForm}</p>
            <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">{isAmbiguousCase ? t("worked.ambiguous") : t("worked.notAmbiguous")}</p>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.sigFigs"), value: `${sigFigs}`, emphasize: true },
            { label: t("worked.note"), value: isAmbiguousCase ? t("worked.trailingZerosNote") : t("worked.noTrailingZerosNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
