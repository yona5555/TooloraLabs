"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const ELEMENTS: { key: string; symbol: string; mass: string }[] = [
  { key: "hydrogen", symbol: "H", mass: "1.008 g/mol" },
  { key: "carbon", symbol: "C", mass: "12.011 g/mol" },
  { key: "nitrogen", symbol: "N", mass: "14.007 g/mol" },
  { key: "oxygen", symbol: "O", mass: "15.999 g/mol" },
  { key: "sodium", symbol: "Na", mass: "22.990 g/mol" },
  { key: "chlorine", symbol: "Cl", mass: "35.45 g/mol" },
];

export default function MolarMassReferenceTable() {
  const t = useTranslations("tools.molar-mass-calculator.referenceTable");
  const tElements = useTranslations("tools.molar-mass-calculator.referenceTable.elements");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnElement")}
      columnValue={t("columnMass")}
      rows={ELEMENTS.map((e) => ({ key: e.key, label: `${tElements(e.key)} (${e.symbol})`, value: e.mass }))}
    />
  );
}
