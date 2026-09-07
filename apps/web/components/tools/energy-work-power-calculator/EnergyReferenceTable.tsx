"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const DEVICES: { key: string; power: string }[] = [
  { key: "ledBulb", power: "10 W" },
  { key: "humanResting", power: "100 W" },
  { key: "laptop", power: "65 W" },
  { key: "incandescentBulb", power: "60 W" },
  { key: "microwave", power: "1,000 W" },
  { key: "hairDryer", power: "1,500 W" },
];

export default function EnergyReferenceTable() {
  const t = useTranslations("tools.energy-work-power-calculator.referenceTable");
  const tDevices = useTranslations("tools.energy-work-power-calculator.referenceTable.devices");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnDevice")}
      columnValue={t("columnPower")}
      rows={DEVICES.map((d) => ({ key: d.key, label: tDevices(d.key), value: d.power }))}
    />
  );
}
