"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const LAUNCH_SPEEDS: { key: string; speed: string }[] = [
  { key: "basketballFreeThrow", speed: "≈ 7 m/s" },
  { key: "soccerKick", speed: "≈ 25 m/s" },
  { key: "javelinThrow", speed: "≈ 30 m/s" },
  { key: "baseballPitch", speed: "≈ 40 m/s" },
  { key: "tennisServe", speed: "≈ 60 m/s" },
  { key: "handgunBullet", speed: "≈ 370 m/s" },
];

export default function ProjectileMotionReferenceTable() {
  const t = useTranslations("tools.projectile-motion-calculator.referenceTable");
  const tSpeeds = useTranslations("tools.projectile-motion-calculator.referenceTable.launchSpeeds");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnItem")}
      columnValue={t("columnSpeed")}
      rows={LAUNCH_SPEEDS.map((s) => ({ key: s.key, label: tSpeeds(s.key), value: s.speed }))}
    />
  );
}
