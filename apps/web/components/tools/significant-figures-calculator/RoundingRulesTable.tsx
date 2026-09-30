"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard, { type ReferenceTableRow } from "@/components/tool-ui/ReferenceTableCard";
import { countSignificantFigures } from "@tooloralabs/tools";

const EXAMPLES: { key: string; raw: string }[] = [
  { key: "nonZero", raw: "4823" },
  { key: "embeddedZero", raw: "4028" },
  { key: "leadingZero", raw: "0.0073" },
  { key: "trailingWithDecimal", raw: "5.400" },
  { key: "trailingNoDecimal", raw: "5400" },
];

/** Type #17 (Tagged Reference Table): five real numbers, each tagged with the specific counting rule that applies to it — computed live via this tool's own countSignificantFigures, not a static lookup table. */
export default function RoundingRulesTable() {
  const t = useTranslations("tools.significant-figures-calculator.education.rulesTable");

  const rows: ReferenceTableRow[] = EXAMPLES.map((ex) => ({
    key: ex.key,
    label: ex.raw,
    value: t("sigFigsValue", { count: countSignificantFigures(ex.raw) }),
    tag: { text: t(`rules.${ex.key}`), colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" },
  }));

  return <ReferenceTableCard title={t("title")} caption={t("intro")} columnLabel={t("columnNumber")} columnValue={t("columnCount")} rows={rows} />;
}
