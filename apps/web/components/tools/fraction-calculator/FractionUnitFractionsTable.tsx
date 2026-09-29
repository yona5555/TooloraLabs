"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard, { type ReferenceTableRow } from "@/components/tool-ui/ReferenceTableCard";

/** Type #17 (Tagged Reference Table): the unit fractions from 1/2 to 1/10, each with its real decimal value and a tag for whether that decimal terminates or repeats — a genuine property of the denominator's prime factors (only 2s and 5s terminate). */
export default function FractionUnitFractionsTable() {
  const t = useTranslations("tools.fraction-calculator.education.unitFractions");

  function terminates(denominator: number): boolean {
    let d = denominator;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    return d === 1;
  }

  const rows: ReferenceTableRow[] = Array.from({ length: 9 }, (_, i) => {
    const denominator = i + 2;
    const decimal = 1 / denominator;
    const isTerminating = terminates(denominator);
    return {
      key: `unit-${denominator}`,
      label: `1/${denominator}`,
      value: isTerminating ? `${decimal}` : `${decimal.toFixed(6)}…`,
      tag: isTerminating
        ? { text: t("tagTerminating"), colorClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" }
        : { text: t("tagRepeating"), colorClass: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
    };
  });

  return <ReferenceTableCard title={t("title")} caption={t("intro")} columnLabel={t("columnFraction")} columnValue={t("columnDecimal")} rows={rows} />;
}
