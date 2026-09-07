"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const SOLUTIONS: { key: string; molarity: string }[] = [
  { key: "physiologicalSaline", molarity: "≈ 0.154 M" },
  { key: "seawater", molarity: "≈ 0.599 M" },
  { key: "stockNaOH", molarity: "≈ 10 M" },
  { key: "concentratedHCl", molarity: "≈ 12.1 M" },
  { key: "concentratedAmmonia", molarity: "≈ 14.8 M" },
  { key: "concentratedH2SO4", molarity: "≈ 18.4 M" },
];

export default function MolarityReferenceTable() {
  const t = useTranslations("tools.molarity-calculator.referenceTable");
  const tSolutions = useTranslations("tools.molarity-calculator.referenceTable.solutions");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnSolution")}
      columnValue={t("columnMolarity")}
      rows={SOLUTIONS.map((s) => ({ key: s.key, label: tSolutions(s.key), value: s.molarity }))}
    />
  );
}
