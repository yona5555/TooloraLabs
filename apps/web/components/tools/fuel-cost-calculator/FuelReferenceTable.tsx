"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const VEHICLE_CLASSES: { key: string; rate: string }[] = [
  { key: "subcompact", rate: "6.0 L/100km (39 mpg)" },
  { key: "midsize", rate: "7.5 L/100km (31 mpg)" },
  { key: "compactSuv", rate: "8.5 L/100km (28 mpg)" },
  { key: "fullsizeSuv", rate: "11.5 L/100km (20 mpg)" },
  { key: "pickupTruck", rate: "13.0 L/100km (18 mpg)" },
  { key: "hybridSedan", rate: "4.5 L/100km (52 mpg)" },
];

export default function FuelReferenceTable() {
  const t = useTranslations("tools.fuel-cost-calculator.referenceTable");
  const tClasses = useTranslations("tools.fuel-cost-calculator.referenceTable.classes");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnClass")}
      columnValue={t("columnRate")}
      rows={VEHICLE_CLASSES.map((v) => ({ key: v.key, label: tClasses(v.key), value: v.rate }))}
    />
  );
}
