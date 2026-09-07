"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const R_UNITS: { key: string; value: string }[] = [
  { key: "litersAtm", value: "0.0821 L·atm/(mol·K)" },
  { key: "joules", value: "8.314 J/(mol·K)" },
  { key: "kilopascals", value: "8.314 L·kPa/(mol·K)" },
  { key: "torr", value: "62.36 L·torr/(mol·K)" },
  { key: "calories", value: "1.987 cal/(mol·K)" },
];

export default function GasLawReferenceTable() {
  const t = useTranslations("tools.ideal-gas-law-calculator.referenceTable");
  const tUnits = useTranslations("tools.ideal-gas-law-calculator.referenceTable.units");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnUnit")}
      columnValue={t("columnValue")}
      rows={R_UNITS.map((r) => ({ key: r.key, label: tUnits(r.key), value: r.value }))}
    />
  );
}
