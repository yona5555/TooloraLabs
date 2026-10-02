"use client";
import { useTranslations } from "next-intl";
import { SignificantFiguresCalculator, countSignificantFigures } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

const tool = new SignificantFiguresCalculator();

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #13 (Stepped Diagram): multiplying the live A and B — always multiplication here — limited to the fewest real significant figures either input has, the opposite rule from addition's decimal-place limit. */
export default function MultiplyDivideWorkedFlow() {
  const t = useTranslations("tools.significant-figures-calculator.education.multiplyDivideFlow");
  const { dims } = useSignificantFiguresLive();
  if (dims.rawValueB.trim() === "") return null;
  const output = tool.execute({ operation: "multiply", rawValueA: dims.rawValueA, rawValueB: dims.rawValueB, roundToDigits: dims.roundToDigits }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const sfA = countSignificantFigures(dims.rawValueA);
  const sfB = countSignificantFigures(dims.rawValueB);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-2 text-center font-mono text-lg">
          <span className="text-blue-700 dark:text-blue-300">{dims.rawValueA}</span>
          <span className="text-zinc-400">×</span>
          <span className="text-rose-700 dark:text-rose-300">{dims.rawValueB}</span>
          <span className="text-zinc-400">=</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">{round3(output.data.roundedResult)}</span>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.sigFigsA"), value: `${sfA}` },
            { label: t("worked.sigFigsB"), value: `${sfB}` },
            { label: t("worked.rule"), value: t("worked.ruleValue", { count: Math.min(sfA, sfB) }) },
            { label: t("worked.result"), value: `${round3(output.data.roundedResult)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
