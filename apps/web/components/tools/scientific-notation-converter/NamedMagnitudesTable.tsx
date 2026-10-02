"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard, { type ReferenceTableRow } from "@/components/tool-ui/ReferenceTableCard";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

const NAMES: { key: string; exponent: number }[] = [
  { key: "thousand", exponent: 3 },
  { key: "million", exponent: 6 },
  { key: "billion", exponent: 9 },
  { key: "trillion", exponent: 12 },
  { key: "quadrillion", exponent: 15 },
  { key: "thousandth", exponent: -3 },
  { key: "millionth", exponent: -6 },
  { key: "billionth", exponent: -9 },
  { key: "trillionth", exponent: -12 },
];

/** Type #17 (Tagged Reference Table): the real named magnitudes this engine itself recognizes — highlighting whichever one matches the live A's own exponent exactly. */
export default function NamedMagnitudesTable() {
  const t = useTranslations("tools.scientific-notation-converter.education.namedMagnitudes");
  const { dims } = useScientificNotationLive();
  const exponentA = Math.round(deriveEffectiveA(dims).exponent);

  const rows: ReferenceTableRow[] = NAMES.map((n) => ({
    key: n.key,
    label: t(`names.${n.key}`),
    value: `10^${n.exponent}`,
    tag: n.exponent === exponentA ? { text: t("matchTag"), colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" } : undefined,
  }));

  return <ReferenceTableCard title={t("title")} caption={t("intro", { exponent: exponentA })} columnLabel={t("columnName")} columnValue={t("columnValue")} rows={rows} />;
}
