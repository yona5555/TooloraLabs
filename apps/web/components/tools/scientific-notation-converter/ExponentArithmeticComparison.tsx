"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

/** Type #16 (Side-by-Side Comparison Cards): the live A and B exponents, added for multiplication and subtracted for division — both real rules shown together so the difference between them stays visible. */
export default function ExponentArithmeticComparison() {
  const t = useTranslations("tools.scientific-notation-converter.education.exponentArithmetic");
  const { dims } = useScientificNotationLive();
  const eA = Math.round(deriveEffectiveA(dims).exponent);
  const eB = Math.round(dims.exponentB);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{t("multiplyLabel")}</p>
            <p className="mt-2 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${eA} + ${eB} = ${eA + eB}`}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("divideLabel")}</p>
            <p className="mt-2 font-mono text-lg font-bold text-zinc-700 dark:text-zinc-200">{`${eA} − ${eB} = ${eA - eB}`}</p>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.exponentA"), value: `${eA}` },
            { label: t("worked.exponentB"), value: `${eB}` },
          ]}
        />
      </div>
    </SectionCard>
  );
}
