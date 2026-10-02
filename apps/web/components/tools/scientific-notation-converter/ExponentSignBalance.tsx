"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

const RANGE = 15;

/** Type #14 (Balance Indicator): the live A and B exponents on a shared positive/negative balance — a positive exponent means a large number, negative means small, and the two live markers show exactly how far each sits from zero. */
export default function ExponentSignBalance() {
  const t = useTranslations("tools.scientific-notation-converter.education.exponentSign");
  const { dims } = useScientificNotationLive();
  const exponentA = deriveEffectiveA(dims).exponent;

  const pctA = ((Math.min(RANGE, Math.max(-RANGE, exponentA)) + RANGE) / (2 * RANGE)) * 100;
  const pctB = ((Math.min(RANGE, Math.max(-RANGE, dims.exponentB)) + RANGE) / (2 * RANGE)) * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="relative mt-5 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
        <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${pctA}%` }} />
        <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-rose-600 transition-all duration-300 dark:border-zinc-900" style={{ left: `${pctB}%` }} />
      </div>
      <div dir="ltr" className="mt-2 flex justify-between text-sm font-semibold">
        <span className="text-blue-700 dark:text-blue-400">{`A: 10^${Math.round(exponentA)}`}</span>
        <span className="text-rose-700 dark:text-rose-400">{`B: 10^${Math.round(dims.exponentB)}`}</span>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: "A", value: exponentA >= 0 ? t("worked.large") : t("worked.small") },
            { label: "B", value: dims.exponentB >= 0 ? t("worked.large") : t("worked.small"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
