"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const MATERIALS: { key: string; density: string }[] = [
  { key: "air", density: "1.2 kg/m³" },
  { key: "ice", density: "917 kg/m³" },
  { key: "water", density: "1,000 kg/m³" },
  { key: "aluminum", density: "2,700 kg/m³" },
  { key: "iron", density: "7,874 kg/m³" },
  { key: "gold", density: "19,300 kg/m³" },
];

export default function DensityReferenceTable() {
  const t = useTranslations("tools.density-calculator.referenceTable");
  const tMaterials = useTranslations("tools.density-calculator.referenceTable.materials");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnMaterial")}
      columnValue={t("columnDensity")}
      rows={MATERIALS.map((m) => ({ key: m.key, label: tMaterials(m.key), value: m.density }))}
    />
  );
}
