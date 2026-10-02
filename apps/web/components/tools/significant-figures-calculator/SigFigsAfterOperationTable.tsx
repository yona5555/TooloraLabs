"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard, { type ReferenceTableRow } from "@/components/tool-ui/ReferenceTableCard";
import { SignificantFiguresCalculator } from "@tooloralabs/tools";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

const tool = new SignificantFiguresCalculator();
const OPS = ["add", "subtract", "multiply", "divide"] as const;

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Type #17 (Tagged Reference Table): all four real arithmetic operations run on the live A and B at once — highlighting whichever one is actually selected above the fold. */
export default function SigFigsAfterOperationTable() {
  const t = useTranslations("tools.significant-figures-calculator.education.sigFigsAfterOp");
  const { dims } = useSignificantFiguresLive();
  if (dims.rawValueB.trim() === "") return null;

  const rows: ReferenceTableRow[] = OPS.map((op) => {
    const output = tool.execute({ operation: op, rawValueA: dims.rawValueA, rawValueB: dims.rawValueB, roundToDigits: 10 }, { locale: "en-US" });
    const value = output.success && !output.data.error ? `${round3(output.data.roundedResult)}` : "—";
    return {
      key: op,
      label: t(`opNames.${op}`),
      value,
      tag: op === dims.operation ? { text: t("selectedTag"), colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" } : undefined,
    };
  });

  return <ReferenceTableCard title={t("title")} caption={t("intro", { a: dims.rawValueA, b: dims.rawValueB })} columnLabel={t("columnOperation")} columnValue={t("columnResult")} rows={rows} />;
}
