"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard, { type ReferenceTableRow } from "@/components/tool-ui/ReferenceTableCard";

const NAMES: { key: string; exponent: number }[] = [
  { key: "thousandth", exponent: -3 },
  { key: "millionth", exponent: -6 },
  { key: "billionth", exponent: -9 },
  { key: "trillionth", exponent: -12 },
  { key: "thousand", exponent: 3 },
  { key: "million", exponent: 6 },
  { key: "billion", exponent: 9 },
  { key: "trillion", exponent: 12 },
  { key: "quadrillion", exponent: 15 },
];

/** Type #17 (Tagged Reference Table): every named magnitude this tool's engine actually recognizes (NAME_BY_EXPONENT), from thousandth to quadrillion, tagged by whether it names a fraction or a multiple of one. */
export default function NamedMagnitudesTable() {
  const t = useTranslations("tools.scientific-notation-converter.education.namedMagnitudes");

  const rows: ReferenceTableRow[] = NAMES.map((n) => ({
    key: n.key,
    label: t(`names.${n.key}`),
    value: `10^${n.exponent}`,
    tag:
      n.exponent < 0
        ? { text: t("tagFraction"), colorClass: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" }
        : { text: t("tagMultiple"), colorClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  }));

  return <ReferenceTableCard title={t("title")} caption={t("intro")} columnLabel={t("columnName")} columnValue={t("columnExponent")} rows={rows} />;
}
