"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const CONSTANTS: { key: string; value: string }[] = [
  { key: "avogadro", value: "6.022 × 10²³ /mol" },
  { key: "stpMolarVolume", value: "22.414 L/mol" },
  { key: "standardPressure", value: "101.325 kPa" },
  { key: "gasConstant", value: "8.314 J/(mol·K)" },
  { key: "waterMolarMass", value: "18.015 g/mol" },
];

export default function StoichiometryReferenceTable() {
  const t = useTranslations("tools.stoichiometry-calculator.referenceTable");
  const tConstants = useTranslations("tools.stoichiometry-calculator.referenceTable.constants");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnConstant")}
      columnValue={t("columnValue")}
      rows={CONSTANTS.map((c) => ({ key: c.key, label: tConstants(c.key), value: c.value }))}
    />
  );
}
