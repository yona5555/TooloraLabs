"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard, { type ReferenceTableRow } from "@/components/tool-ui/ReferenceTableCard";
import { SignificantFiguresCalculator } from "@tooloralabs/tools";

const tool = new SignificantFiguresCalculator();

const PAIRS: { key: string; op: "add" | "multiply"; a: string; b: string }[] = [
  { key: "pair1", op: "add", a: "8.6", b: "2.35" },
  { key: "pair2", op: "multiply", a: "6.1", b: "5.29" },
  { key: "pair3", op: "add", a: "100.0", b: "1.24" },
  { key: "pair4", op: "multiply", a: "2.0", b: "8.05" },
];

/** Type #17 (Tagged Reference Table): four real add/multiply pairs run through this tool's own engine, tagged by which rule governed the result — decimal places for addition, significant figures for multiplication — a quick-reference version of the two detailed flow diagrams above. */
export default function SigFigsAfterOperationTable() {
  const t = useTranslations("tools.significant-figures-calculator.education.operationTable");

  const rows: ReferenceTableRow[] = PAIRS.map((p) => {
    const output = tool.execute({ operation: p.op, rawValueA: p.a, rawValueB: p.b, roundToDigits: 0 }, { locale: "en-US" });
    const resultStr = output.success && !output.data.error ? `${output.data.roundedResult}` : "—";
    return {
      key: p.key,
      label: `${p.a} ${p.op === "add" ? "+" : "×"} ${p.b}`,
      value: resultStr,
      tag: {
        text: p.op === "add" ? t("tagDecimal") : t("tagSigFig"),
        colorClass: p.op === "add" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      },
    };
  });

  return <ReferenceTableCard title={t("title")} caption={t("intro")} columnLabel={t("columnProblem")} columnValue={t("columnResult")} rows={rows} />;
}
