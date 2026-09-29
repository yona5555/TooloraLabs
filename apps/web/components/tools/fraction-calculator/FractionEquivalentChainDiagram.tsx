"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const N = 1;
const D = 2;
const MULTIPLIERS = [1, 2, 3, 4, 5];

/** Type #13 (Stepped Diagram): five equivalent fractions to 1/2, each built by multiplying both numerator and denominator by the same real factor — every step is a genuinely different fraction that still equals exactly 0.5. */
export default function FractionEquivalentChainDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.equivalentChain");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: `${N}/${D}` })}</p>
      <div dir="ltr" className="mt-5 flex flex-wrap items-end gap-3">
        {MULTIPLIERS.map((m, i) => (
          <div key={m} className="flex flex-col items-center gap-1.5" style={{ marginTop: `${(MULTIPLIERS.length - 1 - i) * 6}px` }}>
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
              <p className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">{`${N * m}/${D * m}`}</p>
            </div>
            <p className="text-[11px] text-zinc-400">{`×${m}`}</p>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={MULTIPLIERS.map((m) => ({ label: `×${m}`, value: `${N * m}/${D * m} = ${(N * m) / (D * m)}`, emphasize: m === 1 }))}
        />
      </div>
    </SectionCard>
  );
}
