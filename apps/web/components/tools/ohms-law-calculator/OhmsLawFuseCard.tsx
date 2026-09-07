"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";

type OhmsLawFuseCardProps = {
  current: number;
  digitStyle: DigitStyle;
};

const STANDARD_FUSE_RATINGS = [1, 2, 3, 5, 10, 13, 15, 20, 30];

function nearestFuseRating(current: number): number {
  return STANDARD_FUSE_RATINGS.find((rating) => rating >= current) ?? STANDARD_FUSE_RATINGS[STANDARD_FUSE_RATINGS.length - 1];
}

/**
 * A quick "which standard fuse would this need" fact computed live from the
 * result's own current — fills the gap below the mode tabs, matching the
 * Rule-of-72-style bonus card pattern used elsewhere on the site.
 */
export default function OhmsLawFuseCard({ current, digitStyle }: OhmsLawFuseCardProps) {
  const t = useTranslations("tools.ohms-law-calculator.fuseCard");
  const rating = nearestFuseRating(Math.abs(current));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      {current > 0 && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("result", { current: formatLocalizedNumber(current, digitStyle, { maximumFractionDigits: 2 }), rating })}
        </p>
      )}
    </SectionCard>
  );
}
