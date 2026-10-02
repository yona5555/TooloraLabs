"use client";
import { useTranslations } from "next-intl";
import { SignificantFiguresCalculator, countDecimalPlaces } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

const tool = new SignificantFiguresCalculator();

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #13 (Stepped Diagram): addition on the live A and B — always addition here, regardless of the operation actually selected — limited to the fewest real decimal places either input has, never the most. */
export default function AddSubtractWorkedFlow() {
  const t = useTranslations("tools.significant-figures-calculator.education.addSubtractFlow");
  const { dims } = useSignificantFiguresLive();
  if (dims.rawValueB.trim() === "") return null;
  const output = tool.execute({ operation: "add", rawValueA: dims.rawValueA, rawValueB: dims.rawValueB, roundToDigits: dims.roundToDigits }, { locale: "en-US" });
  if (!output.success || output.data.error) return null;
  const decA = countDecimalPlaces(dims.rawValueA);
  const decB = countDecimalPlaces(dims.rawValueB);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center font-mono text-lg">
        <span className="text-blue-700 dark:text-blue-300">{dims.rawValueA}</span>
        <span className="text-zinc-400">+</span>
        <span className="text-rose-700 dark:text-rose-300">{dims.rawValueB}</span>
        <span className="text-zinc-400">=</span>
        <span className="font-bold text-emerald-700 dark:text-emerald-400">{round3(output.data.roundedResult)}</span>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.decimalPlacesA"), value: `${decA}` },
            { label: t("worked.decimalPlacesB"), value: `${decB}` },
            { label: t("worked.rule"), value: t("worked.ruleValue", { count: Math.min(decA, decB) }) },
            { label: t("worked.result"), value: `${round3(output.data.roundedResult)}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
