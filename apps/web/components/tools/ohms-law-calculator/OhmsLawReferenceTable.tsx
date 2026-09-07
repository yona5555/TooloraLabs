"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const SOURCES: { key: string; voltage: string }[] = [
  { key: "aaBattery", voltage: "1.5 V" },
  { key: "nineVoltBattery", voltage: "9 V" },
  { key: "usbPort", voltage: "5 V" },
  { key: "carBattery", voltage: "12 V" },
  { key: "usOutlet", voltage: "120 V" },
  { key: "euOutlet", voltage: "230 V" },
];

export default function OhmsLawReferenceTable() {
  const t = useTranslations("tools.ohms-law-calculator.referenceTable");
  const tSources = useTranslations("tools.ohms-law-calculator.referenceTable.sources");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnSource")}
      columnValue={t("columnVoltage")}
      rows={SOURCES.map((s) => ({ key: s.key, label: tSources(s.key), value: s.voltage }))}
    />
  );
}
