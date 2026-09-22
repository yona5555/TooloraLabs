"use client";
import { useTranslations } from "next-intl";
import { ACTIVITY_MULTIPLIERS, type ActivityLevel } from "@tooloralabs/tools";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const ACTIVITY_LEVELS: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "veryActive"];

/**
 * The exact multipliers `calculateTDEE` applies to BMR — never out of sync
 * with the engine since they're imported, not retyped.
 */
export default function TDEEActivityMultiplierReference() {
  const t = useTranslations("tools.tdee-calculator");

  return (
    <ReferenceTableCard
      title={t("aboveFold.activityReference.title")}
      caption={t("aboveFold.activityReference.caption")}
      columnLabel={t("form.activityLabel")}
      columnValue={t("aboveFold.activityReference.columnMultiplier")}
      rows={ACTIVITY_LEVELS.map((level) => ({
        key: level,
        label: t(`form.activity.${level}`),
        value: `×${ACTIVITY_MULTIPLIERS[level].toFixed(3)}`,
      }))}
    />
  );
}
