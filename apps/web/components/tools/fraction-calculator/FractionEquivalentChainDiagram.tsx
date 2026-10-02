"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useFractionLive } from "./FractionLiveContext";

const MULTIPLIERS = [2, 3, 4];

/** Type #11-style equivalence chain: the live fraction A, scaled up by 2, 3, and 4 — the same real value every time, proof that multiplying the numerator and denominator by the same number never changes what a fraction represents. */
export default function FractionEquivalentChainDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.equivalentChain");
  const { dims } = useFractionLive();
  if (dims.denominatorA === 0) return null;

  const chain = [1, ...MULTIPLIERS].map((m) => ({ numerator: dims.numeratorA * m, denominator: dims.denominatorA * m }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-2 font-mono text-base">
          {chain.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={i === 0 ? "font-bold text-blue-700 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}>{`${f.numerator}/${f.denominator}`}</span>
              {i < chain.length - 1 && <ArrowRight className="text-zinc-300 dark:text-zinc-600" size={16} />}
            </div>
          ))}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={chain.map((f, i) => ({ label: i === 0 ? t("worked.original") : t("worked.timesN", { n: MULTIPLIERS[i - 1] }), value: `${f.numerator}/${f.denominator}`, emphasize: i === 0 }))}
        />
      </div>
    </SectionCard>
  );
}
