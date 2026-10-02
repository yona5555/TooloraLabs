"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #16 (Side-by-Side Comparison Cards): the live A and B, compared directly by real order of magnitude — how many powers of ten actually separate them. */
export default function MagnitudeComparisonCards() {
  const t = useTranslations("tools.scientific-notation-converter.education.magnitudeComparison");
  const { dims } = useScientificNotationLive();
  const a = deriveEffectiveA(dims);
  const valueA = a.coefficient * 10 ** a.exponent;
  const valueB = dims.coefficientB * 10 ** dims.exponentB;
  const aIsBigger = Math.abs(valueA) >= Math.abs(valueB);
  const orderGap = Math.abs(Math.round(a.exponent) - Math.round(dims.exponentB));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 grid grid-cols-2 gap-3">
          <div className={`rounded-xl border p-4 text-center ${aIsBigger ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">A</p>
            <p className="mt-2 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{`${round3(a.coefficient)} × 10^${Math.round(a.exponent)}`}</p>
          </div>
          <div className={`rounded-xl border p-4 text-center ${!aIsBigger ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40"}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500 dark:text-rose-400">B</p>
            <p className="mt-2 font-mono text-lg font-bold text-rose-700 dark:text-rose-300">{`${dims.coefficientB} × 10^${Math.round(dims.exponentB)}`}</p>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.bigger"), value: aIsBigger ? "A" : "B", emphasize: true },
            { label: t("worked.orderGap"), value: t("worked.ordersOfMagnitude", { count: orderGap }) },
          ]}
        />
      </div>
    </SectionCard>
  );
}
