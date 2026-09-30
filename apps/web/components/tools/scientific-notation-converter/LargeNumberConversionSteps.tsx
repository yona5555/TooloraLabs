"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { ScientificNotationConverter } from "@tooloralabs/tools";

const tool = new ScientificNotationConverter();
const VALUE = 45000000;

/** Type #9 (Timeline with Stations): a real large number, moved through the three stations this tool's toScientific operation actually runs — count the digits, place the decimal after the first, read off the exponent. */
export default function LargeNumberConversionSteps() {
  const t = useTranslations("tools.scientific-notation-converter.education.largeSteps");
  const output = tool.execute({ operation: "toScientific", standardValue: VALUE, coefficientA: 0, exponentA: 0, coefficientB: 0, exponentB: 0 }, { locale: "en-US" });
  if (!output.success) return null;
  const { scientific } = output.data;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.standard")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{VALUE.toLocaleString("en-US")}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.decimalPlaced")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`${scientific.coefficient}`}</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-2.5 dark:bg-zinc-800/60">
          <span className="w-40 shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400">{t("steps.exponentCounted")}</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{`${scientific.coefficient} × 10^${scientific.exponent}`}</span>
          <span className="ms-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{t("resultBadge")}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.digitsAfterFirst"), value: `${scientific.exponent}` },
            { label: t("worked.result"), value: `${scientific.coefficient} × 10^${scientific.exponent}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
