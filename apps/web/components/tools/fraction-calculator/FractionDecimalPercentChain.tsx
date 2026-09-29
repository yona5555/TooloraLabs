"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const NUM = 5;
const DEN = 8;

/** Type #11 (Side-by-Side Equivalence), extended to a three-way chain: the same value as a fraction, a decimal, and a percentage — three notations, one real number. */
export default function FractionDecimalPercentChain() {
  const t = useTranslations("tools.fraction-calculator.education.decimalPercent");
  const decimal = NUM / DEN;
  const percent = decimal * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{`${NUM}/${DEN}`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("fractionLabel")}</p>
        </div>
        <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">=</span>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{decimal}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("decimalLabel")}</p>
        </div>
        <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">=</span>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{`${percent}%`}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("percentLabel")}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.divide"), value: `${NUM} ÷ ${DEN} = ${decimal}` },
            { label: t("worked.multiply"), value: `${decimal} × 100 = ${percent}%`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
