"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const FORCES: { key: string; force: string }[] = [
  { key: "apple", force: "≈ 1 N" },
  { key: "oneKilogram", force: "≈ 9.8 N" },
  { key: "adultWeight", force: "≈ 686 N" },
  { key: "humanBite", force: "≈ 750 N" },
  { key: "smallCarWeight", force: "≈ 11,760 N" },
  { key: "saturnVThrust", force: "≈ 34,000,000 N" },
];

export default function ForceReferenceTable() {
  const t = useTranslations("tools.force-calculator.referenceTable");
  const tForces = useTranslations("tools.force-calculator.referenceTable.forces");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnItem")}
      columnValue={t("columnForce")}
      rows={FORCES.map((f) => ({ key: f.key, label: tForces(f.key), value: f.force }))}
    />
  );
}
