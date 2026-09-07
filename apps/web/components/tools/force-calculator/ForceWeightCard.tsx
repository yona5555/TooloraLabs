"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";

type ForceWeightCardProps = {
  force: number;
  digitStyle: DigitStyle;
};

const GRAVITY = 9.8;

/**
 * A quick "how heavy does that feel" fact computed live from the result's
 * own force — fills the gap below the mode tabs, matching the
 * Rule-of-72-style bonus card pattern used elsewhere on the site.
 */
export default function ForceWeightCard({ force, digitStyle }: ForceWeightCardProps) {
  const t = useTranslations("tools.force-calculator.weightCard");
  const equivalentMass = Math.abs(force) / GRAVITY;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      {force !== 0 && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("result", { mass: formatLocalizedNumber(equivalentMass, digitStyle, { maximumFractionDigits: 2 }) })}
        </p>
      )}
    </SectionCard>
  );
}
