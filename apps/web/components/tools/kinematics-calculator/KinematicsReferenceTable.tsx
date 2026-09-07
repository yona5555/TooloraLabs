"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const SPEEDS: { key: string; speed: string }[] = [
  { key: "walking", speed: "1.4 m/s" },
  { key: "usainBolt", speed: "12.4 m/s" },
  { key: "highwayCar", speed: "27.8 m/s" },
  { key: "commercialJet", speed: "250 m/s" },
  { key: "speedOfSound", speed: "343 m/s" },
  { key: "speedOfLight", speed: "3 × 10⁸ m/s" },
];

export default function KinematicsReferenceTable() {
  const t = useTranslations("tools.kinematics-calculator.referenceTable");
  const tSpeeds = useTranslations("tools.kinematics-calculator.referenceTable.speeds");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnItem")}
      columnValue={t("columnSpeed")}
      rows={SPEEDS.map((s) => ({ key: s.key, label: tSpeeds(s.key), value: s.speed }))}
    />
  );
}
